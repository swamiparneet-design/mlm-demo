using Microsoft.EntityFrameworkCore;
using MLM.Domain.Interfaces;
using MLM.Domain.Entities;
using MLM.Domain.Enums;

namespace MLM.Infrastructure.Persistence.Seed;

/// <summary>
/// Idempotent startup seeding: safe to run every time the app starts, it only
/// inserts data that does not already exist.
/// </summary>
public static class SeedData
{
    public static async Task SeedAsync(ApplicationDbContext context, IPasswordHasher passwordHasher)
    {
        await SeedSuperAdminAsync(context, passwordHasher);
        await SeedZonesAndStagesAsync(context);
    }

    private static async Task SeedSuperAdminAsync(ApplicationDbContext context, IPasswordHasher passwordHasher)
    {
        var exists = await context.Users.AnyAsync(u => u.Role == UserRole.SuperAdmin);
        if (exists)
        {
            return;
        }

        context.Users.Add(new User
        {
            FullName = "Super Admin",
            Email = "superadmin@mlm.com",
            Mobile = "9999999999",
            PasswordHash = passwordHasher.HashPassword("Admin@12345"),
            Role = UserRole.SuperAdmin,
            ReferrerUserId = null,
            KycStatus = KycStatus.Verified,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        });

        await context.SaveChangesAsync();
    }

    private static async Task SeedZonesAndStagesAsync(ApplicationDbContext context)
    {
        var generalZone = await context.Zones.FirstOrDefaultAsync(z => z.ZoneName == "General Zone");
        if (generalZone is null)
        {
            generalZone = new Zone
            {
                ZoneName = "General Zone",
                SequenceOrder = 1,
                EntryAmount = 5599m,
                RequiresNewInvestmentIfDirectEntry = false,
                PlacementStrategyType = PlacementStrategyType.Sequential,
                CapacityLimit = null,
                IsActive = true
            };
            context.Zones.Add(generalZone);
            await context.SaveChangesAsync();

            context.Stages.AddRange(
                new Stage
                {
                    ZoneId = generalZone.Id,
                    StageName = "Earth",
                    SequenceOrder = 1,
                    RequiredPlacementCount = 5,
                    RequiredReferralCount = 0,
                    PayoutAmount = 5600m,
                    RetentionPercentage = 0m,
                    ItemReward = null,
                    IsActive = true
                },
                new Stage
                {
                    ZoneId = generalZone.Id,
                    StageName = "Water",
                    SequenceOrder = 2,
                    RequiredPlacementCount = 25,
                    RequiredReferralCount = 2,
                    PayoutAmount = 70000m,
                    RetentionPercentage = 0m,
                    ItemReward = null,
                    IsActive = true
                },
                new Stage
                {
                    ZoneId = generalZone.Id,
                    StageName = "Fire",
                    SequenceOrder = 3,
                    RequiredPlacementCount = 125,
                    RequiredReferralCount = 0,
                    PayoutAmount = 100000m,
                    RetentionPercentage = 0m,
                    ItemReward = "Gift",
                    IsActive = true
                },
                new Stage
                {
                    ZoneId = generalZone.Id,
                    StageName = "Sky",
                    SequenceOrder = 4,
                    RequiredPlacementCount = 625,
                    RequiredReferralCount = 0,
                    PayoutAmount = 1010587m,
                    RetentionPercentage = 10m,
                    ItemReward = "E-Bike",
                    IsActive = true
                });

            await context.SaveChangesAsync();
        }

        var vipZone = await context.Zones.FirstOrDefaultAsync(z => z.ZoneName == "VIP Zone");
        if (vipZone is null)
        {
            vipZone = new Zone
            {
                ZoneName = "VIP Zone",
                SequenceOrder = 2,
                EntryAmount = 50000m,
                RequiresNewInvestmentIfDirectEntry = true,
                PlacementStrategyType = PlacementStrategyType.Sequential,
                CapacityLimit = null,
                IsActive = true
            };
            context.Zones.Add(vipZone);
            await context.SaveChangesAsync();

            // Same stage names/counts as General Zone; PayoutAmount scaled up 10x.
            context.Stages.AddRange(
                new Stage
                {
                    ZoneId = vipZone.Id,
                    StageName = "Earth",
                    SequenceOrder = 1,
                    RequiredPlacementCount = 5,
                    RequiredReferralCount = 0,
                    PayoutAmount = 56000m,
                    RetentionPercentage = 0m,
                    ItemReward = null,
                    IsActive = true
                },
                new Stage
                {
                    ZoneId = vipZone.Id,
                    StageName = "Water",
                    SequenceOrder = 2,
                    RequiredPlacementCount = 25,
                    RequiredReferralCount = 2,
                    PayoutAmount = 700000m,
                    RetentionPercentage = 0m,
                    ItemReward = null,
                    IsActive = true
                },
                new Stage
                {
                    ZoneId = vipZone.Id,
                    StageName = "Fire",
                    SequenceOrder = 3,
                    RequiredPlacementCount = 125,
                    RequiredReferralCount = 0,
                    PayoutAmount = 1000000m,
                    RetentionPercentage = 0m,
                    ItemReward = "Gift",
                    IsActive = true
                },
                new Stage
                {
                    ZoneId = vipZone.Id,
                    StageName = "Sky",
                    SequenceOrder = 4,
                    RequiredPlacementCount = 625,
                    RequiredReferralCount = 0,
                    PayoutAmount = 10105870m,
                    RetentionPercentage = 10m,
                    ItemReward = "E-Bike",
                    IsActive = true
                });

            await context.SaveChangesAsync();
        }
    }
}
