using Aeon.Common.Kernel.Domain;

namespace Aeon.Identity.Domain.Events;

// Domain event raised when a user account is locked due to failed login attempts.
public sealed class UserLockedOutEvent: DomainEvent
{
    // The ID of the locked user.
    public Guid UserId { get; }

    // The number of failed attempts that caused the lockout.
    public int FailedAttempts { get; }

    // When the lockout expires.
    public DateTime LockoutEnd { get; }

    public UserLockedOutEvent(Guid userId, int failedAttempts, DateTime lockoutEnd)
    {
        UserId = userId;
        FailedAttempts = failedAttempts;
        LockoutEnd = lockoutEnd;
    }
}