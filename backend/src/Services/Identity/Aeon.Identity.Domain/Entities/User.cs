using Aeon.Common.Kernel.Domain;
using Aeon.Common.Kernel.Exceptions;
using Aeon.Identity.Domain.Enums;
using Aeon.Identity.Domain.Events;

namespace Aeon.Identity.Domain.Entities;

public sealed class User : BaseEntity
{
    public const int MaxFailedAttempts = 5;
    public const int LockoutDurationMinutes = 15;

    public string Email { get; private set; } = string.Empty;
    public string NormalizedEmail { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public Role Role { get; private set; } = Role.Member;
    public UserStatus Status { get; private set; } = UserStatus.Pending;
    public bool RequiresPasswordChange { get; private set; } = true;
    public int FailedLoginAttempts { get; private set; }
    public DateTime? LockoutEnd { get; private set; }
    public DateTime? LastLoginAt { get; private set; }
    public string? PasswordResetToken { get; private set; }
    public DateTime? PasswordResetTokenExpiry { get; private set; }
    public bool TwoFactorEnabled { get; private set; }
    public string? TwoFactorSecret { get; private set; }
    public bool TwoFactorSkipped { get; private set; }
    public DateTime? TwoFactorEnabledAt { get; private set; }

    private User() { }

    public static User Create(
        string email,
        string firstName,
        string lastName,
        string passwordHash,
        Role role = Role.Member)
    {
        ValidateEmail(email);
        ValidateName(firstName, nameof(firstName));
        ValidateName(lastName, nameof(lastName));

        if (string.IsNullOrWhiteSpace(passwordHash))
        {
            throw new ValidationException("PasswordHash", "Password hash is required.");
        }

        var user = new User
        {
            Email = email.Trim(),
            NormalizedEmail = email.Trim().ToUpperInvariant(),
            FirstName = firstName.Trim(),
            LastName = lastName.Trim(),
            PasswordHash = passwordHash,
            Role = role,
            Status = UserStatus.Active,
            RequiresPasswordChange = true
        };

        user.AddDomainEvent(new UserCreatedEvent(user.Id, user.Email));

        return user;
    }

    public void RecordSuccessfulLogin(string? ipAddress, string? userAgent)
    {
        FailedLoginAttempts = 0;
        LockoutEnd = null;
        LastLoginAt = DateTime.UtcNow;

        AddDomainEvent(new UserLoggedInEvent(Id, ipAddress, userAgent));
    }

    public void RecordFailedLogin()
    {
        FailedLoginAttempts++;

        if (FailedLoginAttempts >= MaxFailedAttempts)
        {
            LockoutEnd = DateTime.UtcNow.AddMinutes(LockoutDurationMinutes);
            AddDomainEvent(new UserLockedOutEvent(Id, FailedLoginAttempts, LockoutEnd.Value));
        }
    }

    public bool IsLockedOut()
    {
        if (LockoutEnd == null)
            return false;

        if (DateTime.UtcNow >= LockoutEnd)
        {
            LockoutEnd = null;
            FailedLoginAttempts = 0;
            return false;
        }

        return true;
    }

    public void ChangePassword(string newPasswordHash)
    {
        if (string.IsNullOrWhiteSpace(newPasswordHash))
        {
            throw new ValidationException("PasswordHash", "Password hash is required.");
        }

        var wasTemporary = RequiresPasswordChange;

        PasswordHash = newPasswordHash;
        RequiresPasswordChange = false;
        PasswordResetToken = null;
        PasswordResetTokenExpiry = null;

        AddDomainEvent(new PasswordChangedEvent(Id, wasTemporary));
    }

    public void GeneratePasswordResetToken(string token, int expiryHours = 1)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            throw new ValidationException("Token", "Reset token is required.");
        }

        PasswordResetToken = token;
        PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(expiryHours);
    }

    public bool ValidatePasswordResetToken(string token)
    {
        if (string.IsNullOrWhiteSpace(PasswordResetToken))
            return false;

        if (PasswordResetTokenExpiry == null || DateTime.UtcNow > PasswordResetTokenExpiry)
            return false;

        return string.Equals(PasswordResetToken, token, StringComparison.Ordinal);
    }

    public void Activate()
    {
        if (Status == UserStatus.Disabled)
        {
            throw new ValidationException("Status", "Disabled accounts cannot be activated.");
        }

        Status = UserStatus.Active;
    }

    public void Disable()
    {
        Status = UserStatus.Disabled;
    }

    public void UpdateProfile(string firstName, string lastName)
    {
        ValidateName(firstName, nameof(firstName));
        ValidateName(lastName, nameof(lastName));

        FirstName = firstName.Trim();
        LastName = lastName.Trim();
    }

    public string FullName => $"{FirstName} {LastName}";

    public void SetupTwoFactor(string encryptedSecret)
    {
        if (string.IsNullOrWhiteSpace(encryptedSecret))
        {
            throw new ValidationException("TwoFactorSecret", "Two-factor secret is required.");
        }

        TwoFactorSecret = encryptedSecret;
        TwoFactorSkipped = false;
    }

    public void EnableTwoFactor()
    {
        if (string.IsNullOrWhiteSpace(TwoFactorSecret))
        {
            throw new ValidationException("TwoFactor", "Two-factor must be set up before enabling.");
        }

        TwoFactorEnabled = true;
        TwoFactorEnabledAt = DateTime.UtcNow;
        TwoFactorSkipped = false;

        AddDomainEvent(new TwoFactorEnabledEvent(Id));
    }

    public void DisableTwoFactor()
    {
        TwoFactorEnabled = false;
        TwoFactorSecret = null;
        TwoFactorEnabledAt = null;

        AddDomainEvent(new TwoFactorDisabledEvent(Id));
    }

    public void SkipTwoFactorSetup()
    {
        TwoFactorSkipped = true;
    }

    public bool ShouldPromptFor2FASetup =>
        !TwoFactorEnabled && !TwoFactorSkipped && !RequiresPasswordChange;

    private static void ValidateEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new ValidationException("Email", "Email is required.");
        }

        if (!email.Contains('@') || !email.Contains('.'))
        {
            throw new ValidationException("Email", "Invalid email format.");
        }

        if (email.Length > 256)
        {
            throw new ValidationException("Email", "Email must not exceed 256 characters.");
        }
    }

    private static void ValidateName(string name, string fieldName)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ValidationException(fieldName, $"{fieldName} is required.");
        }

        if (name.Length > 100)
        {
            throw new ValidationException(fieldName, $"{fieldName} must not exceed 100 characters.");
        }
    }
}