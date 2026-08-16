namespace MLM.Domain.Entities;

/// <summary>
/// Maintains an O(1) pointer to the last user placed in a given zone, so that
/// SequentialPlacementStrategy never needs to scan the placement table to find
/// where to attach the next user. One row per Zone.
/// </summary>
public class ZonePlacementCursor
{
    public int Id { get; set; }

    public int ZoneId { get; set; }
    public Zone Zone { get; set; } = null!;

    /// <summary>
    /// Null when the zone has no placements yet.
    /// </summary>
    public int? LastPlacedUserId { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
