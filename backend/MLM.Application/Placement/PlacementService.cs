using Microsoft.EntityFrameworkCore;
using MLM.Application.Common.Exceptions;
using MLM.Domain.Interfaces;
using MLM.Domain.Entities;
using MLM.Domain.Enums;

namespace MLM.Application.Placement;

public class PlacementService : IPlacementService
{
    private readonly IApplicationDbContext _context;
    private readonly IPlacementStrategyFactory _strategyFactory;

    public PlacementService(IApplicationDbContext context, IPlacementStrategyFactory strategyFactory)
    {
        _context = context;
        _strategyFactory = strategyFactory;
    }

    public async Task<IReadOnlyList<int>> PlaceNewUserAsync(int newUserId, int zoneId, CancellationToken cancellationToken = default)
    {
        var zone = await _context.Zones.FirstOrDefaultAsync(z => z.Id == zoneId, cancellationToken)
            ?? throw new NotFoundException(nameof(Zone), zoneId);

        var strategy = _strategyFactory.GetStrategy(zone.PlacementStrategyType);
        var placement = await strategy.PlaceUserAsync(newUserId, zoneId, cancellationToken);

        // Self row - depth 0.
        _context.PlacementClosures.Add(new PlacementClosure
        {
            ZoneId = zoneId,
            AncestorUserId = newUserId,
            DescendantUserId = newUserId,
            Depth = 0
        });

        var affectedAncestorIds = new List<int>();

        if (placement.ParentUserId is int parentUserId)
        {
            // Every ancestor of the parent (including the parent itself, via its
            // own self-row) becomes an ancestor of the new user at depth+1.
            var parentAncestorRows = await _context.PlacementClosures
                .Where(c => c.ZoneId == zoneId && c.DescendantUserId == parentUserId)
                .Select(c => new { c.AncestorUserId, c.Depth })
                .ToListAsync(cancellationToken);

            foreach (var row in parentAncestorRows)
            {
                _context.PlacementClosures.Add(new PlacementClosure
                {
                    ZoneId = zoneId,
                    AncestorUserId = row.AncestorUserId,
                    DescendantUserId = newUserId,
                    Depth = row.Depth + 1
                });
                affectedAncestorIds.Add(row.AncestorUserId);
            }
        }

        var firstStage = await _context.Stages
            .Where(s => s.ZoneId == zoneId && s.IsActive)
            .OrderBy(s => s.SequenceOrder)
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException($"Zone {zoneId} has no active stages configured.");

        var existingProgress = await _context.UserZoneProgresses
            .FirstOrDefaultAsync(p => p.UserId == newUserId && p.CurrentZoneId == zoneId, cancellationToken);

        if (existingProgress is null)
        {
            _context.UserZoneProgresses.Add(new UserZoneProgress
            {
                UserId = newUserId,
                CurrentZoneId = zoneId,
                CurrentStageId = firstStage.Id,
                CurrentPlacementCount = 0,
                CurrentReferralCount = 0,
                Status = ProgressStatus.InProgress,
                StartedAt = DateTime.UtcNow
            });
        }

        return affectedAncestorIds;
    }
}
