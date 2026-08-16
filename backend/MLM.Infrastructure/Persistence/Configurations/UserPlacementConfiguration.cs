using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MLM.Domain.Entities;

namespace MLM.Infrastructure.Persistence.Configurations;

public class UserPlacementConfiguration : IEntityTypeConfiguration<UserPlacement>
{
    public void Configure(EntityTypeBuilder<UserPlacement> builder)
    {
        builder.ToTable("UserPlacements");
        builder.HasKey(p => p.Id);

        builder.HasIndex(p => new { p.UserId, p.ZoneId }).IsUnique();
        builder.HasIndex(p => new { p.ZoneId, p.ParentUserId });

        builder.HasOne(p => p.User)
            .WithMany()
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.ParentUser)
            .WithMany()
            .HasForeignKey(p => p.ParentUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Zone)
            .WithMany()
            .HasForeignKey(p => p.ZoneId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
