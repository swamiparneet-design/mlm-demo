using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MLM.Domain.Entities;

namespace MLM.Infrastructure.Persistence.Configurations;

public class ZonePlacementCursorConfiguration : IEntityTypeConfiguration<ZonePlacementCursor>
{
    public void Configure(EntityTypeBuilder<ZonePlacementCursor> builder)
    {
        builder.ToTable("ZonePlacementCursors");
        builder.HasKey(c => c.Id);

        builder.HasIndex(c => c.ZoneId).IsUnique();

        builder.HasOne(c => c.Zone)
            .WithMany()
            .HasForeignKey(c => c.ZoneId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
