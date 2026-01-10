using Aeon.Identity.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aeon.Identity.Infrastructure.Persistence.Configurations;

public sealed class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    // <inheritdoc />
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("refresh_tokens");

        // Primary key
        builder.HasKey(rt => rt.Id);

        builder.Property(rt => rt.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        // Token hash
        builder.Property(rt => rt.TokenHash)
            .HasColumnName("token_hash")
            .HasMaxLength(256)
            .IsRequired();

        builder.HasIndex(rt => rt.TokenHash)
            .HasDatabaseName("ix_refresh_tokens_token_hash");

        // User relationship
        builder.Property(rt => rt.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.HasIndex(rt => rt.UserId)
            .HasDatabaseName("ix_refresh_tokens_user_id");

        // Expiry & revocation
        builder.Property(rt => rt.ExpiresAt)
            .HasColumnName("expires_at")
            .IsRequired();

        builder.Property(rt => rt.IsRevoked)
            .HasColumnName("is_revoked")
            .HasDefaultValue(false);

        builder.Property(rt => rt.RevokedAt)
            .HasColumnName("revoked_at");

        builder.Property(rt => rt.ReplacedByTokenHash)
            .HasColumnName("replaced_by_token_hash")
            .HasMaxLength(256);

        // Request info
        builder.Property(rt => rt.CreatedFromIp)
            .HasColumnName("created_from_ip")
            .HasMaxLength(45); // IPv6 max length

        builder.Property(rt => rt.CreatedFromUserAgent)
            .HasColumnName("created_from_user_agent")
            .HasMaxLength(512);

        // Audit fields
        builder.Property(rt => rt.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(rt => rt.UpdatedAt)
            .HasColumnName("updated_at");

        builder.Property(rt => rt.CreatedBy)
            .HasColumnName("created_by")
            .HasMaxLength(256);

        builder.Property(rt => rt.UpdatedBy)
            .HasColumnName("updated_by")
            .HasMaxLength(256);
    }
}