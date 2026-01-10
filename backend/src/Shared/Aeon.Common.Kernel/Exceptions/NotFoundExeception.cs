namespace Aeon.Common.Kernel.Exceptions;

public sealed class NotFoundException: DomainException
{
    private const string DefaultErrorCode = "RESOURCE_NOT_FOUND";


    public string EntityType { get; }


    public object?  EntityId { get; }


    public NotFoundException(string entityType, object?  entityId)
        : base($"{entityType} with identifier '{entityId}' was not found.", DefaultErrorCode)
    {
        EntityType = entityType;
        EntityId = entityId;
    }

    public NotFoundException(string message)
        : base(message, DefaultErrorCode)
    {
        EntityType = string.Empty;
        EntityId = null;
    }

    public static NotFoundException ForEntity<TEntity>(object entityId)
        => new(typeof(TEntity).Name, entityId);
}