namespace MLM.Domain.Entities;

/// <summary>
/// A Stage belongs to a Zone and is fully admin-configurable at runtime.
/// Placement/referral thresholds are cumulative totals within the parent zone.
/// </summary>
public class Stage
{
    public int Id { get; set; }
    public int ZoneId { get; set; }
    public Zone Zone { get; set; } = null!;

    public string StageName { get; set; } = string.Empty;
    public int SequenceOrder { get; set; }
    public int RequiredPlacementCount { get; set; }
    public int RequiredReferralCount { get; set; }
    public decimal PayoutAmount { get; set; }
    public decimal RetentionPercentage { get; set; }
    public string? ItemReward { get; set; }
    public bool IsActive { get; set; } = true;
}
