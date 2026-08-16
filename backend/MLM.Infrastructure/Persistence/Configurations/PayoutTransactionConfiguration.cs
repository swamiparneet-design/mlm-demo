using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MLM.Domain.Entities;

namespace MLM.Infrastructure.Persistence.Configurations;

public class PayoutTransactionConfiguration : IEntityTypeConfiguration<PayoutTransaction>
{
    public void Configure(EntityTypeBuilder<PayoutTransaction> builder)
    {
        builder.ToTable("PayoutTransactions");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.GrossAmount).HasColumnType("decimal(18,2)");
        builder.Property(p => p.RetentionAmount).HasColumnType("decimal(18,2)");
        builder.Property(p => p.NetPayoutAmount).HasColumnType("decimal(18,2)");
        builder.Property(p => p.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(p => p.IdempotencyKey).IsRequired().HasMaxLength(100);

        // Guarantees a stage can never pay out twice, even under concurrent or
        // retried processing - the database itself enforces this invariant.
        builder.HasIndex(p => p.IdempotencyKey).IsUnique();

        builder.HasOne(p => p.User)
            .WithMany()
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Zone)
            .WithMany()
            .HasForeignKey(p => p.ZoneId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Stage)
            .WithMany()
            .HasForeignKey(p => p.StageId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
