using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MLM.Domain.Entities;

namespace MLM.Infrastructure.Persistence.Configurations;

public class PlacementClosureConfiguration : IEntityTypeConfiguration<PlacementClosure>
{
    public void Configure(EntityTypeBuilder<PlacementClosure> builder)
    {
        builder.ToTable("PlacementClosures");
        builder.HasKey(c => c.Id);

        // The core query pattern ("count everyone under user X in zone Z") hits
        // this index directly - no recursive tree walk, ever.
        builder.HasIndex(c => new { c.ZoneId, c.AncestorUserId, c.DescendantUserId }).IsUnique();
        builder.HasIndex(c => new { c.ZoneId, c.DescendantUserId });

        builder.HasOne(c => c.AncestorUser)
            .WithMany()
            .HasForeignKey(c => c.AncestorUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.DescendantUser)
            .WithMany()
            .HasForeignKey(c => c.DescendantUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Zone)
            .WithMany()
            .HasForeignKey(c => c.ZoneId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
