namespace MLM.Application.StageProgression;

/// <summary>
/// The stage-completion rule engine + payout engine. Structured as a single,
/// clean async entry point so it can later be invoked from a background job
/// scheduler (e.g. Hangfire) in addition to the synchronous placement flow,
/// without any redesign.
/// </summary>
public interface IStageProgressionService
{
    /// <summary>
    /// Recalculates placement/referral counts for every given user (across all of
    /// their currently in-progress zones) and cascades stage completion + payout
    /// creation as far as the recalculated counts allow. Does not open/commit a
    /// transaction or call SaveChanges - the caller owns that.
    /// </summary>
    Task RecalculateAndCascadeAsync(IEnumerable<int> userIds, CancellationToken cancellationToken = default);
}
