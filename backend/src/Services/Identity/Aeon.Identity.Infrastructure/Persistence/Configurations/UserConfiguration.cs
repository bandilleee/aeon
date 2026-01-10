using Aeon.Identity.Domain.Entities;
using Aeon.Identity.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aeon.Identity.Infrastructure.Persistence.Configurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        // Primary key
        builder.HasKey(u => u.Id);

        builder.Property(u => u.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        // Email
        builder.Property(u => u.Email)
            .HasColumnName("email")
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(u => u.NormalizedEmail)
            .HasColumnName("normalized_email")
            .HasMaxLength(256)
            .IsRequired();

        builder.HasIndex(u => u.NormalizedEmail)
            .IsUnique()
            .HasDatabaseName("ix_users_normalized_email");

        // Password
        builder.Property(u => u.PasswordHash)
            .HasColumnName("password_hash")
            .HasMaxLength(256)
            .IsRequired();

        // Name
        builder.Property(u => u.FirstName)
            .HasColumnName("first_name")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(u => u.LastName)
            .HasColumnName("last_name")
            .HasMaxLength(100)
            .IsRequired();

        // Role & Status
        builder.Property(u => u.Role)
            .HasColumnName("role")
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(Role.Member);

        builder.Property(u => u.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(UserStatus. Pending);

        // Password change flag
        builder.Property(u => u.RequiresPasswordChange)
            .HasColumnName("requires_password_change")
            .HasDefaultValue(true);

        // Lockout
        builder.Property(u => u.FailedLoginAttempts)
            .HasColumnName("failed_login_attempts")
            .HasDefaultValue(0);

        builder.Property(u => u.LockoutEnd)
            .HasColumnName("lockout_end");

        builder.Property(u => u.LastLoginAt)
            .HasColumnName("last_login_at");

        // Password reset
        builder.Property(u => u.PasswordResetToken)
            .HasColumnName("password_reset_token")
            .HasMaxLength(256);

        builder.Property(u => u.PasswordResetTokenExpiry)
            .HasColumnName("password_reset_token_expiry");

        // 2FA
        builder.Property(u => u.TwoFactorEnabled)
            .HasColumnName("two_factor_enabled")
            .HasDefaultValue(false);

        builder.Property(u => u.TwoFactorSecret)
            .HasColumnName("two_factor_secret")
            .HasMaxLength(256);

        builder.Property(u => u.TwoFactorSkipped)
            .HasColumnName("two_factor_skipped")
            .HasDefaultValue(false);

        builder.Property(u => u.TwoFactorEnabledAt)
            .HasColumnName("two_factor_enabled_at");

        // Audit fields
        builder.Property(u => u.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(u => u.UpdatedAt)
            .HasColumnName("updated_at");

        builder.Property(u => u.CreatedBy)
            .HasColumnName("created_by")
            .HasMaxLength(256);

        builder.Property(u => u.UpdatedBy)
            .HasColumnName("updated_by")
            .HasMaxLength(256);
    }
}