namespace Aeon.Common.Kernel.Exceptions;

public sealed class ConflictException: DomainException
{
    private const string DefaultErrorCode = "CONFLICT";


    public string? ResourceType { get; }


    public string? ConflictingField { get; }


    public ConflictException(string message)
        : base(message, DefaultErrorCode)
    {
    }

    public ConflictException(string resourceType, string conflictingField, object? value)
        : base($"A {resourceType} with {conflictingField} '{value}' already exists.", DefaultErrorCode)
    {
        ResourceType = resourceType;
        ConflictingField = conflictingField;
    }

    public static ConflictException DuplicateEntity<TEntity>(string fieldName, object? value)
        => new(typeof(TEntity).Name, fieldName, value);

    public static ConflictException DuplicateEmail(string email)
        => new("User", "email", email);

    public static ConflictException DuplicateUsername(string username)
        => new("User", "username", username);
}