using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using MLM.Domain.Entities;

namespace MLM.Domain.Interfaces;

/// <summary>
/// Abstraction over the EF Core DbContext so the Application layer can express
/// queries/commands without depending on Infrastructure or a specific provider.
/// Lives in Domain (rather than Application) so that Infrastructure - which only
/// references Domain, not Application - can implement it directly.
/// </summary>
public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Zone> Zones { get; }
    DbSet<Stage> Stages { get; }
    DbSet<UserPlacement> UserPlacements { get; }
    DbSet<PlacementClosure> PlacementClosures { get; }
    DbSet<UserReferral> UserReferrals { get; }
    DbSet<UserZoneProgress> UserZoneProgresses { get; }
    DbSet<PayoutTransaction> PayoutTransactions { get; }
    DbSet<ZonePlacementCursor> ZonePlacementCursors { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);
}
