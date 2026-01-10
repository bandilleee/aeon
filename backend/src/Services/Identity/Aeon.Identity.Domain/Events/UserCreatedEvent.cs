using Aeon.Common.Kernel.Domain;

namespace Aeon.Identity.Domain.Events;

// Domain event raised when a new user is created. 
public sealed class UserCreatedEvent: DomainEvent
{
    // The ID of the created user.
    public Guid UserId { get; }

    // The email of the created user.
    public string Email { get; }

    public UserCreatedEvent(Guid userId, string email)
    {
        UserId = userId;
        Email = email;
    }
}