namespace Aeon.Common.Kernel.Domain;

// Marker interface for all entities. 
// Enables generic constraints and repository patterns.
public interface IEntity
{
    
    // Unique identifier for the entity. 
    Guid Id { get; }
}