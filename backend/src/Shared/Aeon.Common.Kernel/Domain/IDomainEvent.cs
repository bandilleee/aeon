using MediatR;

namespace Aeon.Common.Kernel.Domain;

public interface IDomainEvent: INotification
{
    Guid EventId { get; }
    DateTime OccurredAt { get; }
}