using MLM.Domain.Enums;

namespace MLM.Domain.Entities;

/// <summary>
/// A single, immutable financial record of a stage-completion payout.
/// IdempotencyKey (derived from UserId+StageId) is unique and prevents the same
/// stage from ever paying out twice, even under concurrent/retried processing.
/// </summary>
public class PayoutTransaction
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int ZoneId { get; set; }
    public Zone Zone { get; set; } = null!;

    public int StageId { get; set; }
    public Stage Stage { get; set; } = null!;

    public decimal GrossAmount { get; set; }
    public decimal RetentionAmount { get; set; }
    public decimal NetPayoutAmount { get; set; }

    public PayoutStatus Status { get; set; } = PayoutStatus.Completed;

    /// <summary>
    /// Unique, derived as "{UserId}-{StageId}". Prevents duplicate payouts.
    /// </summary>
    public string IdempotencyKey { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
