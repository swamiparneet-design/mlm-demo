namespace MLM.Domain.Entities;

/// <summary>
/// Records the direct parent-child placement edge for a user within a specific zone,
/// as decided by the pluggable IPlacementStrategy. One row per (UserId, ZoneId).
/// </summary>
public class UserPlacement
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int ZoneId { get; set; }
    public Zone Zone { get; set; } = null!;

    /// <summary>
    /// Null when this user is the very first (root) placement in the zone.
    /// </summary>
    public int? ParentUserId { get; set; }
    public User? ParentUser { get; set; }

    public DateTime PlacedAt { get; set; } = DateTime.UtcNow;
}
