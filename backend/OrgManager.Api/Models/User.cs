namespace OrgManager.Api.Models
{
    public class User
    {
        public Guid Id { get; set; }

        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;

        public string? AvatarUrl { get; set; }

        public string Role { get; set; } = "member";
        public string Status { get; set; } = "pending";

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }

        // Enterprise admin fields
        public string Phone { get; set; } = string.Empty;
        public string TwoFactorStatus { get; set; } = "disabled";
        public string Notes { get; set; } = string.Empty;

        public string Tags { get; set; } = string.Empty;
        public string Permissions { get; set; } = "{}";
        public bool CustomPermissions { get; set; } = false;

        public string? StatusReason { get; set; }
        public DateTime? StatusChangedAt { get; set; }

        public int FailedLoginAttempts { get; set; } = 0;
        public int LoginCount { get; set; } = 0;
        public DateTime? LastActiveAt { get; set; }

        public bool MustChangePassword { get; set; } = false;
        public DateTime? PasswordLastChanged { get; set; }

        // ─── Password Reset ───────────────────────────────
        public string? PasswordResetToken { get; set; }
        public DateTime? PasswordResetTokenExpiry { get; set; }
    }
}