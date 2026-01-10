using Aeon.Common.Kernel.Domain;

namespace Aeon.Identity.Domain.Events;

public sealed class TwoFactorEnabledEvent : DomainEvent
{
    public Guid UserId { get; }

    public TwoFactorEnabledEvent(Guid userId)
    {
        UserId = userId;
    }
}