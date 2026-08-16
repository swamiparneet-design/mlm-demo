using Microsoft.EntityFrameworkCore;
using MLM.Domain.Interfaces;
using MLM.Domain.Entities;
using MLM.Domain.Enums;

namespace MLM.Application.Placement;

/// <summary>
/// Places every new user under whoever was placed last in that zone, forming a
/// simple, ever-growing chain. Uses ZonePlacementCursor for an O(1) lookup of
/// "who was placed last" instead of scanning the placement table.
/// </summary>
public class SequentialPlacementStrategy : IPlacementStrategy
{
    private readonly IApplicationDbContext _context;

    public SequentialPlacementStrategy(IApplicationDbContext context)
    {
        _context = context;
    }

    public PlacementStrategyType StrategyType => PlacementStrategyType.Sequential;

    public async Task<UserPlacement> PlaceUserAsync(int newUserId, int zoneId, CancellationToken cancellationToken = default)
    {
        var cursor = await _context.ZonePlacementCursors
            .FirstOrDefaultAsync(c => c.ZoneId == zoneId, cancellationToken);

        if (cursor is null)
        {
            cursor = new ZonePlacementCursor { ZoneId = zoneId, LastPlacedUserId = null };
            _context.ZonePlacementCursors.Add(cursor);
        }

        var parentUserId = cursor.LastPlacedUserId;

        var placement = new UserPlacement
        {
            UserId = newUserId,
            ZoneId = zoneId,
            ParentUserId = parentUserId,
            PlacedAt = DateTime.UtcNow
        };
        _context.UserPlacements.Add(placement);

        cursor.LastPlacedUserId = newUserId;
        cursor.UpdatedAt = DateTime.UtcNow;

        return placement;
    }
}
