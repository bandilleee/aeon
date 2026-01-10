using Aeon.Common.Kernel.Domain;

namespace Aeon.Identity.Domain.Events;

/// Domain event raised when a user's password is changed.
public sealed class PasswordChangedEvent: DomainEvent
{
    // The ID of the user whose password was changed.
    public Guid UserId { get; }

    // Whether this was a forced password change (temporary password replaced).
    public bool WasTemporaryPassword { get; }

    public PasswordChangedEvent(Guid userId, bool wasTemporaryPassword)
    {
        UserId = userId;
        WasTemporaryPassword = wasTemporaryPassword;
    }
}