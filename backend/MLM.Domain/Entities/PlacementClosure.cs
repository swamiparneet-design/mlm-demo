namespace MLM.Domain.Entities;

/// <summary>
/// Closure table for the placement hierarchy. For every user placed under a parent,
/// a row is inserted linking that user to EVERY ancestor of the parent (plus a
/// self-row at depth 0). This makes "total placement count under any user" a simple
/// COUNT query instead of a recursive tree walk, which is critical at huge scale.
///
/// Scoped per Zone (ZoneId) because the same user can occupy different positions
/// in different zone trees.
/// </summary>
public class PlacementClosure
{
    public int Id { get; set; }

    public int ZoneId { get; set; }
    public Zone Zone { get; set; } = null!;

    public int AncestorUserId { get; set; }
    public User AncestorUser { get; set; } = null!;

    public int DescendantUserId { get; set; }
    public User DescendantUser { get; set; } = null!;

    /// <summary>
    /// 0 when AncestorUserId == DescendantUserId (self row).
    /// </summary>
    public int Depth { get; set; }
}
