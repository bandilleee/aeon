using Aeon.Identity.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aeon.Identity.Infrastructure.Persistence.Configurations;

// EF Core configuration for the BackupCode entity.
public sealed class BackupCodeConfiguration : IEntityTypeConfiguration<BackupCode>
{
    // <inheritdoc />
    public void Configure(EntityTypeBuilder<BackupCode> builder)
    {
        builder.ToTable("backup_codes");

        // Primary key
        builder.HasKey(bc => bc.Id);

        builder.Property(bc => bc.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        // Code hash
        builder.Property(bc => bc.CodeHash)
            .HasColumnName("code_hash")
            .HasMaxLength(256)
            .IsRequired();

        // User relationship
        builder.Property(bc => bc.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.HasIndex(bc => bc.UserId)
            .HasDatabaseName("ix_backup_codes_user_id");

        // Composite index for lookup
        builder.HasIndex(bc => new { bc.UserId, bc.CodeHash })
            .HasDatabaseName("ix_backup_codes_user_id_code_hash");

        // Usage tracking
        builder.Property(bc => bc.IsUsed)
            .HasColumnName("is_used")
            .HasDefaultValue(false);

        builder.Property(bc => bc.UsedAt)
            .HasColumnName("used_at");

        // Audit fields
        builder.Property(bc => bc.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(bc => bc.UpdatedAt)
            .HasColumnName("updated_at");

        builder.Property(bc => bc.CreatedBy)
            .HasColumnName("created_by")
            .HasMaxLength(256);

        builder.Property(bc => bc.UpdatedBy)
            .HasColumnName("updated_by")
            .HasMaxLength(256);
    }
}