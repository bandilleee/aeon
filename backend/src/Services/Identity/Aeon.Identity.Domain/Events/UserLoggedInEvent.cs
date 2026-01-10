using Aeon.Common.Kernel.Domain;

namespace Aeon.Identity.Domain.Events;

// Domain event raised when a user successfully logs in.
public sealed class UserLoggedInEvent: DomainEvent
{
    // The ID of the user who logged in.
    public Guid UserId { get; }

    // The IP address from which the login occurred.
    public string?  IpAddress { get; }

    // The user agent string from the login request.
    public string?  UserAgent { get; }

    public UserLoggedInEvent(Guid userId, string? ipAddress, string? userAgent)
    {
        UserId = userId;
        IpAddress = ipAddress;
        UserAgent = userAgent;
    }
}