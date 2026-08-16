using MLM.Domain.Enums;

namespace MLM.Domain.Entities;

/// <summary>
/// Tracks a user's progress through the stages of a single zone.
/// CurrentPlacementCount / CurrentReferralCount are cumulative totals for that
/// zone, compared against each stage's cumulative RequiredPlacementCount /
/// RequiredReferralCount thresholds. One row per (UserId, ZoneId).
/// </summary>
public class UserZoneProgress
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int CurrentZoneId { get; set; }
    public Zone CurrentZone { get; set; } = null!;

    public int CurrentStageId { get; set; }
    public Stage CurrentStage { get; set; } = null!;

    public int CurrentPlacementCount { get; set; }
    public int CurrentReferralCount { get; set; }

    public ProgressStatus Status { get; set; } = ProgressStatus.InProgress;

    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}
