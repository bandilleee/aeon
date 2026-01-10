using Aeon.Common.Kernel.Domain;

namespace Aeon.Identity.Domain.Events;

public sealed class TwoFactorDisabledEvent : DomainEvent
{
    public Guid UserId { get; }

    public TwoFactorDisabledEvent(Guid userId)
    {
        UserId = userId;
    }
}