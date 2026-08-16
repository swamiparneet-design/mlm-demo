using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MLM.Domain.Entities;

namespace MLM.Infrastructure.Persistence.Configurations;

public class UserZoneProgressConfiguration : IEntityTypeConfiguration<UserZoneProgress>
{
    public void Configure(EntityTypeBuilder<UserZoneProgress> builder)
    {
        builder.ToTable("UserZoneProgresses");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Status).HasConversion<string>().HasMaxLength(20);

        builder.HasIndex(p => new { p.UserId, p.CurrentZoneId }).IsUnique();

        builder.HasOne(p => p.User)
            .WithMany()
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.CurrentZone)
            .WithMany()
            .HasForeignKey(p => p.CurrentZoneId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.CurrentStage)
            .WithMany()
            .HasForeignKey(p => p.CurrentStageId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
