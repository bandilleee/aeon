namespace Aeon.Common.Kernel.Domain;

// Interface for entities that can raise domain events.
// Enables the infrastructure layer to collect and dispatch events after persistence.

public interface IHasDomainEvents
{
    IReadOnlyCollection<IDomainEvent> DomainEvents { get; }

    void ClearDomainEvents();
}