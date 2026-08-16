using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using MLM.Domain.Interfaces;
using MLM.Domain.Entities;

namespace MLM.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Zone> Zones => Set<Zone>();
    public DbSet<Stage> Stages => Set<Stage>();
    public DbSet<UserPlacement> UserPlacements => Set<UserPlacement>();
    public DbSet<PlacementClosure> PlacementClosures => Set<PlacementClosure>();
    public DbSet<UserReferral> UserReferrals => Set<UserReferral>();
    public DbSet<UserZoneProgress> UserZoneProgresses => Set<UserZoneProgress>();
    public DbSet<PayoutTransaction> PayoutTransactions => Set<PayoutTransaction>();
    public DbSet<ZonePlacementCursor> ZonePlacementCursors => Set<ZonePlacementCursor>();

    public async Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        return await Database.BeginTransactionAsync(cancellationToken);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
