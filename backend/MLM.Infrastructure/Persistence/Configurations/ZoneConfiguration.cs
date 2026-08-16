using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MLM.Domain.Entities;

namespace MLM.Infrastructure.Persistence.Configurations;

public class ZoneConfiguration : IEntityTypeConfiguration<Zone>
{
    public void Configure(EntityTypeBuilder<Zone> builder)
    {
        builder.ToTable("Zones");
        builder.HasKey(z => z.Id);

        builder.Property(z => z.ZoneName).IsRequired().HasMaxLength(100);
        builder.Property(z => z.EntryAmount).HasColumnType("decimal(18,2)");
        builder.Property(z => z.PlacementStrategyType).HasConversion<string>().HasMaxLength(30);

        builder.HasIndex(z => z.SequenceOrder).IsUnique();

        builder.HasMany(z => z.Stages)
            .WithOne(s => s.Zone)
            .HasForeignKey(s => s.ZoneId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
