using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MLM.Domain.Entities;

namespace MLM.Infrastructure.Persistence.Configurations;

public class StageConfiguration : IEntityTypeConfiguration<Stage>
{
    public void Configure(EntityTypeBuilder<Stage> builder)
    {
        builder.ToTable("Stages");
        builder.HasKey(s => s.Id);

        builder.Property(s => s.StageName).IsRequired().HasMaxLength(100);
        builder.Property(s => s.PayoutAmount).HasColumnType("decimal(18,2)");
        builder.Property(s => s.RetentionPercentage).HasColumnType("decimal(5,2)");
        builder.Property(s => s.ItemReward).HasMaxLength(200);

        builder.HasIndex(s => new { s.ZoneId, s.SequenceOrder }).IsUnique();
    }
}
