namespace Aeon.Common.Kernel.Domain;


public abstract class BaseEntity: IEntity, IHasDomainEvents
{
    private readonly List<IDomainEvent> _domainEvents = [];


    public Guid Id { get; protected set; } = Guid.NewGuid();


    public DateTime CreatedAt { get; protected set; } = DateTime.UtcNow;


    public DateTime?  UpdatedAt { get; protected set; }


    public string? CreatedBy { get; protected set; }


    public string?  UpdatedBy { get; protected set; }

    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    public void SetCreatedBy(string userId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(userId, nameof(userId));
        CreatedBy = userId;
    }

    public void SetUpdatedBy(string userId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(userId, nameof(userId));
        UpdatedBy = userId;
        UpdatedAt = DateTime.UtcNow;
    }

    protected void AddDomainEvent(IDomainEvent domainEvent)
    {
        ArgumentNullException.ThrowIfNull(domainEvent);
        _domainEvents.Add(domainEvent);
    }

    protected void RemoveDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Remove(domainEvent);
    }


    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }
}