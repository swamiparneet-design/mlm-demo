using Microsoft.EntityFrameworkCore;
using MLM.Application.StageProgression;
using MLM.Domain.Entities;
using MLM.Domain.Enums;
using MLM.Infrastructure.Persistence;
using Xunit;

namespace MLM.Tests.StageProgression;

public class StageProgressionServiceTests
{
    private static ApplicationDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    private static async Task<(Zone Zone, User RootUser)> SeedZoneAndRootUserAsync(
        ApplicationDbContext context,
        params Stage[] stages)
    {
        var zone = new Zone
        {
            ZoneName = "Test Zone",
            SequenceOrder = 1,
            EntryAmount = 1000m,
            PlacementStrategyType = PlacementStrategyType.Sequential,
            IsActive = true
        };
        context.Zones.Add(zone);
        await context.SaveChangesAsync();

        foreach (var stage in stages)
        {
            stage.ZoneId = zone.Id;
            context.Stages.Add(stage);
        }
        await context.SaveChangesAsync();

        var rootUser = new User
        {
            FullName = "Root User",
            Email = $"root-{Guid.NewGuid()}@test.com",
            Mobile = Guid.NewGuid().ToString("N")[..10],
            PasswordHash = "hashed"
        };
        context.Users.Add(rootUser);
        await context.SaveChangesAsync();

        return (zone, rootUser);
    }

    /// <summary>
    /// Adds <paramref name="count"/> descendant users under <paramref name="ancestorUserId"/>
    /// in <paramref name="zoneId"/> via direct PlacementClosure rows, simulating what
    /// PlacementService would have built up over time.
    /// </summary>
    private static async Task AddDescendantPlacementsAsync(
        ApplicationDbContext context, int zoneId, int ancestorUserId, int count)
    {
        for (var i = 0; i < count; i++)
        {
            var descendant = new User
            {
                FullName = $"Descendant {i}",
                Email = $"descendant-{Guid.NewGuid()}@test.com",
                Mobile = Guid.NewGuid().ToString("N")[..10],
                PasswordHash = "hashed"
            };
            context.Users.Add(descendant);
            await context.SaveChangesAsync();

            context.PlacementClosures.Add(new PlacementClosure
            {
                ZoneId = zoneId,
                AncestorUserId = ancestorUserId,
                DescendantUserId = descendant.Id,
                Depth = 1
            });
        }

        await context.SaveChangesAsync();
    }

    [Fact]
    public async Task RecalculateAndCascadeAsync_CalculatesNetPayoutAmount_WithRetentionPercentage()
    {
        await using var context = CreateInMemoryContext();

        var stage = new Stage
        {
            StageName = "Earth",
            SequenceOrder = 1,
            RequiredPlacementCount = 5,
            RequiredReferralCount = 0,
            PayoutAmount = 1000m,
            RetentionPercentage = 10m,
            IsActive = true
        };
        var (zone, rootUser) = await SeedZoneAndRootUserAsync(context, stage);

        await AddDescendantPlacementsAsync(context, zone.Id, rootUser.Id, count: 5);

        context.UserZoneProgresses.Add(new UserZoneProgress
        {
            UserId = rootUser.Id,
            CurrentZoneId = zone.Id,
            CurrentStageId = stage.Id,
            CurrentPlacementCount = 0,
            CurrentReferralCount = 0,
            Status = ProgressStatus.InProgress
        });
        await context.SaveChangesAsync();

        var sut = new StageProgressionService(context);
        await sut.RecalculateAndCascadeAsync(new[] { rootUser.Id });
        await context.SaveChangesAsync();

        var payout = await context.PayoutTransactions
            .SingleAsync(p => p.UserId == rootUser.Id && p.StageId == stage.Id);

        // Gross 1000, 10% retention -> 100 retained, 900 net.
        Assert.Equal(1000m, payout.GrossAmount);
        Assert.Equal(100m, payout.RetentionAmount);
        Assert.Equal(900m, payout.NetPayoutAmount);
        Assert.Equal($"{rootUser.Id}-{stage.Id}", payout.IdempotencyKey);
        Assert.Equal(PayoutStatus.Completed, payout.Status);
    }

    [Fact]
    public async Task RecalculateAndCascadeAsync_NeverPaysOutTwice_ForSameUserAndStage()
    {
        await using var context = CreateInMemoryContext();

        var stage = new Stage
        {
            StageName = "Earth",
            SequenceOrder = 1,
            RequiredPlacementCount = 5,
            RequiredReferralCount = 0,
            PayoutAmount = 1000m,
            RetentionPercentage = 0m,
            IsActive = true
        };
        var (zone, rootUser) = await SeedZoneAndRootUserAsync(context, stage);

        await AddDescendantPlacementsAsync(context, zone.Id, rootUser.Id, count: 5);

        context.UserZoneProgresses.Add(new UserZoneProgress
        {
            UserId = rootUser.Id,
            CurrentZoneId = zone.Id,
            CurrentStageId = stage.Id,
            CurrentPlacementCount = 0,
            CurrentReferralCount = 0,
            Status = ProgressStatus.InProgress
        });

        // Simulate that this stage's payout has already been recorded once
        // (e.g. from a previous, concurrent, or retried run) by pre-inserting
        // the PayoutTransaction with the same idempotency key up front.
        var idempotencyKey = $"{rootUser.Id}-{stage.Id}";
        context.PayoutTransactions.Add(new PayoutTransaction
        {
            UserId = rootUser.Id,
            ZoneId = zone.Id,
            StageId = stage.Id,
            GrossAmount = stage.PayoutAmount,
            RetentionAmount = 0m,
            NetPayoutAmount = stage.PayoutAmount,
            Status = PayoutStatus.Completed,
            IdempotencyKey = idempotencyKey,
            CreatedAt = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        var sut = new StageProgressionService(context);

        // Recalculating/cascading again must NOT create a second payout row,
        // even though the placement counts still satisfy the stage.
        await sut.RecalculateAndCascadeAsync(new[] { rootUser.Id });
        await context.SaveChangesAsync();

        var payoutCount = await context.PayoutTransactions
            .CountAsync(p => p.IdempotencyKey == idempotencyKey);

        Assert.Equal(1, payoutCount);
    }

    [Fact]
    public async Task RecalculateAndCascadeAsync_CascadesThroughMultipleStages_WhenCountsAlreadySatisfyThem()
    {
        await using var context = CreateInMemoryContext();

        var stage1 = new Stage
        {
            StageName = "Earth",
            SequenceOrder = 1,
            RequiredPlacementCount = 5,
            RequiredReferralCount = 0,
            PayoutAmount = 100m,
            RetentionPercentage = 0m,
            IsActive = true
        };
        var stage2 = new Stage
        {
            StageName = "Water",
            SequenceOrder = 2,
            RequiredPlacementCount = 10,
            RequiredReferralCount = 0,
            PayoutAmount = 200m,
            RetentionPercentage = 0m,
            IsActive = true
        };
        var stage3 = new Stage
        {
            StageName = "Fire",
            SequenceOrder = 3,
            RequiredPlacementCount = 20,
            RequiredReferralCount = 0,
            PayoutAmount = 300m,
            RetentionPercentage = 0m,
            IsActive = true
        };
        var (zone, rootUser) = await SeedZoneAndRootUserAsync(context, stage1, stage2, stage3);

        // 15 placements already satisfy stage1 (5) and stage2 (10), but not stage3 (20).
        await AddDescendantPlacementsAsync(context, zone.Id, rootUser.Id, count: 15);

        var progress = new UserZoneProgress
        {
            UserId = rootUser.Id,
            CurrentZoneId = zone.Id,
            CurrentStageId = stage1.Id,
            CurrentPlacementCount = 0,
            CurrentReferralCount = 0,
            Status = ProgressStatus.InProgress
        };
        context.UserZoneProgresses.Add(progress);
        await context.SaveChangesAsync();

        var sut = new StageProgressionService(context);
        await sut.RecalculateAndCascadeAsync(new[] { rootUser.Id });
        await context.SaveChangesAsync();

        var payouts = await context.PayoutTransactions
            .Where(p => p.UserId == rootUser.Id)
            .ToListAsync();

        // Stage1 and Stage2 should have cascaded and paid out in a single call...
        Assert.Equal(2, payouts.Count);
        Assert.Contains(payouts, p => p.StageId == stage1.Id && p.NetPayoutAmount == 100m);
        Assert.Contains(payouts, p => p.StageId == stage2.Id && p.NetPayoutAmount == 200m);
        Assert.DoesNotContain(payouts, p => p.StageId == stage3.Id);

        // ...and progress should now be sitting at stage3, still in progress.
        var updatedProgress = await context.UserZoneProgresses.SingleAsync(p => p.Id == progress.Id);
        Assert.Equal(stage3.Id, updatedProgress.CurrentStageId);
        Assert.Equal(ProgressStatus.InProgress, updatedProgress.Status);
        Assert.Equal(15, updatedProgress.CurrentPlacementCount);
    }
}
