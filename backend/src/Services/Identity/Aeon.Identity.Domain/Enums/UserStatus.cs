namespace Aeon.Identity.Domain.Enums;

// Defines the possible states of a user account.
public enum UserStatus
{
    // Account is pending email verification or initial setup.
    Pending = 0,

    // Account is active and can authenticate.
    Active = 1,

    // Account is temporarily locked (e.g., too many failed attempts).
    Locked = 2,

    // Account is permanently disabled by an administrator.
    Disabled = 3
}