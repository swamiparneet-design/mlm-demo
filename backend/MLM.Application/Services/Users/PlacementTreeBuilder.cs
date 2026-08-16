using Microsoft.EntityFrameworkCore;
using MLM.Domain.Interfaces;
using MLM.Application.DTOs.Users;

namespace MLM.Application.Services.Users;

/// <summary>
/// Builds a nested placement tree DTO rooted at a given user, within a given zone.
/// Loads the whole subtree in two flat queries (descendant ids via the closure
/// table, then their placement rows) and assembles it in memory - simple and fast
/// for typical downline sizes. For extremely large subtrees this could be
/// extended with depth-limiting / pagination without changing the public API.
/// </summary>
public static class PlacementTreeBuilder
{
    public static async Task<PlacementTreeNodeDto?> BuildAsync(
        IApplicationDbContext context,
        int rootUserId,
        int zoneId,
        CancellationToken cancellationToken = default)
    {
        var descendantIds = await context.PlacementClosures
            .Where(c => c.ZoneId == zoneId && c.AncestorUserId == rootUserId)
            .Select(c => c.DescendantUserId)
            .ToListAsync(cancellationToken);

        if (descendantIds.Count == 0)
        {
            return null;
        }

        var nodes = await (
            from p in context.UserPlacements
            join u in context.Users on p.UserId equals u.Id
            where p.ZoneId == zoneId && descendantIds.Contains(p.UserId)
            join progress in context.UserZoneProgresses.Where(pr => pr.CurrentZoneId == zoneId)
                on p.UserId equals progress.UserId into progressJoin
            from progress in progressJoin.DefaultIfEmpty()
            select new
            {
                p.UserId,
                p.ParentUserId,
                p.PlacedAt,
                u.FullName,
                u.Email,
                StageName = progress != null ? progress.CurrentStage.StageName : null
            }).ToListAsync(cancellationToken);

        var nodesByUserId = nodes.ToDictionary(n => n.UserId);
        var childrenByParent = nodes
            .Where(n => n.ParentUserId.HasValue)
            .GroupBy(n => n.ParentUserId!.Value)
            .ToDictionary(g => g.Key, g => g.ToList());

        PlacementTreeNodeDto BuildNode(int userId)
        {
            var data = nodesByUserId[userId];
            var node = new PlacementTreeNodeDto
            {
                UserId = data.UserId,
                FullName = data.FullName,
                Email = data.Email,
                PlacedAt = data.PlacedAt,
                StageName = data.StageName
            };

            if (childrenByParent.TryGetValue(userId, out var children))
            {
                node.Children = children.Select(c => BuildNode(c.UserId)).ToList();
            }

            return node;
        }

        return nodesByUserId.ContainsKey(rootUserId) ? BuildNode(rootUserId) : null;
    }
}
