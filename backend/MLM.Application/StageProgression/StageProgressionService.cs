using Microsoft.EntityFrameworkCore;
using MLM.Domain.Interfaces;
using MLM.Domain.Entities;
using MLM.Domain.Enums;

namespace MLM.Application.StageProgression;

public class StageProgressionService : IStageProgressionService
{
    private readonly IApplicationDbContext _context;

    public StageProgressionService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task RecalculateAndCascadeAsync(IEnumerable<int> userIds, CancellationToken cancellationToken = default)
    {
        foreach (var userId in userIds.Distinct())
        {
            var progressRows = await _context.UserZoneProgresses
                .Where(p => p.UserId == userId && p.Status == ProgressStatus.InProgress)
                .ToListAsync(cancellationToken);

            foreach (var progress in progressRows)
            {
                // Closure table COUNT query - O(1) style lookup, never a recursive tree walk.
                progress.CurrentPlacementCount = await _context.PlacementClosures.CountAsync(
                    c => c.ZoneId == progress.CurrentZoneId
                         && c.AncestorUserId == userId
                         && c.DescendantUserId != userId,
                    cancellationToken);

                progress.CurrentReferralCount = await _context.UserReferrals.CountAsync(
                    r => r.ReferredByUserId == userId,
                    cancellationToken);

                await CascadeStageCompletionAsync(progress, cancellationToken);
            }
        }
    }

    /// <summary>
    /// Repeatedly completes stages while the current (already recalculated) counts
    /// satisfy the current stage's requirements - this is what allows completing
    /// one stage to immediately cascade into completing the next.
    /// </summary>
    private async Task CascadeStageCompletionAsync(UserZoneProgress progress, CancellationToken cancellationToken)
    {
        while (progress.Status == ProgressStatus.InProgress)
        {
            var stage = await _context.Stages.FirstAsync(s => s.Id == progress.CurrentStageId, cancellationToken);

            var requirementsMet = progress.CurrentPlacementCount >= stage.RequiredPlacementCount
                                   && progress.CurrentReferralCount >= stage.RequiredReferralCount;
            if (!requirementsMet)
            {
                break;
            }

            await CompleteStageAsync(progress, stage, cancellationToken);
        }
    }

    private async Task CompleteStageAsync(UserZoneProgress progress, Stage stage, CancellationToken cancellationToken)
    {
        var idempotencyKey = $"{progress.UserId}-{stage.Id}";

        var alreadyPaid = await _context.PayoutTransactions
            .AnyAsync(p => p.IdempotencyKey == idempotencyKey, cancellationToken);

        if (!alreadyPaid)
        {
            var grossAmount = stage.PayoutAmount;
            var retentionAmount = Math.Round(grossAmount * stage.RetentionPercentage / 100m, 2, MidpointRounding.AwayFromZero);
            var netPayoutAmount = grossAmount - retentionAmount;

            _context.PayoutTransactions.Add(new PayoutTransaction
            {
                UserId = progress.UserId,
                ZoneId = stage.ZoneId,
                StageId = stage.Id,
                GrossAmount = grossAmount,
                RetentionAmount = retentionAmount,
                NetPayoutAmount = netPayoutAmount,
                Status = PayoutStatus.Completed,
                IdempotencyKey = idempotencyKey,
                CreatedAt = DateTime.UtcNow
            });
        }

        var nextStage = await _context.Stages
            .Where(s => s.ZoneId == stage.ZoneId && s.IsActive && s.SequenceOrder > stage.SequenceOrder)
            .OrderBy(s => s.SequenceOrder)
            .FirstOrDefaultAsync(cancellationToken);

        if (nextStage is not null)
        {
            progress.CurrentStageId = nextStage.Id;
            return;
        }

        progress.Status = ProgressStatus.Completed;
        progress.CompletedAt = DateTime.UtcNow;

        await EnrollIntoNextZoneAsync(progress, cancellationToken);
    }

    /// <summary>
    /// When the last stage of a zone is completed, initializes the user's
    /// progress record for the next active zone (by SequenceOrder), if one
    /// exists and they are not already enrolled in it. Actual physical
    /// placement (UserPlacement) into that next zone's tree is a separate,
    /// explicit action (particularly for zones that RequireNewInvestmentIfDirectEntry).
    /// </summary>
    private async Task EnrollIntoNextZoneAsync(UserZoneProgress progress, CancellationToken cancellationToken)
    {
        var currentZone = await _context.Zones.FirstAsync(z => z.Id == progress.CurrentZoneId, cancellationToken);

        var nextZone = await _context.Zones
            .Where(z => z.IsActive && z.SequenceOrder > currentZone.SequenceOrder)
            .OrderBy(z => z.SequenceOrder)
            .FirstOrDefaultAsync(cancellationToken);

        if (nextZone is null)
        {
            return;
        }

        var alreadyEnrolled = await _context.UserZoneProgresses
            .AnyAsync(p => p.UserId == progress.UserId && p.CurrentZoneId == nextZone.Id, cancellationToken);
        if (alreadyEnrolled)
        {
            return;
        }

        var nextZoneFirstStage = await _context.Stages
            .Where(s => s.ZoneId == nextZone.Id && s.IsActive)
            .OrderBy(s => s.SequenceOrder)
            .FirstOrDefaultAsync(cancellationToken);

        if (nextZoneFirstStage is null)
        {
            return;
        }

        _context.UserZoneProgresses.Add(new UserZoneProgress
        {
            UserId = progress.UserId,
            CurrentZoneId = nextZone.Id,
            CurrentStageId = nextZoneFirstStage.Id,
            CurrentPlacementCount = 0,
            CurrentReferralCount = 0,
            Status = ProgressStatus.InProgress,
            StartedAt = DateTime.UtcNow
        });
    }
}
