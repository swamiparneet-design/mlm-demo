using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MLM.Domain.Entities;

namespace MLM.Infrastructure.Persistence.Configurations;

public class UserReferralConfiguration : IEntityTypeConfiguration<UserReferral>
{
    public void Configure(EntityTypeBuilder<UserReferral> builder)
    {
        builder.ToTable("UserReferrals");
        builder.HasKey(r => r.Id);

        builder.HasIndex(r => r.UserId).IsUnique();
        builder.HasIndex(r => r.ReferredByUserId);

        builder.HasOne(r => r.User)
            .WithMany()
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.ReferredByUser)
            .WithMany()
            .HasForeignKey(r => r.ReferredByUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
