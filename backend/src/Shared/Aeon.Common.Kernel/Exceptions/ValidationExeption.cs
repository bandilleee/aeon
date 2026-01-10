namespace Aeon.Common.Kernel.Exceptions;

// Exception thrown when business validation rules are violated.
// Maps to HTTP 400 Bad Request. 

public sealed class ValidationException: DomainException
{
    private const string DefaultErrorCode = "VALIDATION_ERROR";

    public IReadOnlyDictionary<string, string[]> Errors { get; }

    public ValidationException(string message)
        : base(message, DefaultErrorCode)
    {
        Errors = new Dictionary<string, string[]>
        {
            { "General", [message] }
        };
    }

    public ValidationException(IDictionary<string, string[]> errors)
        : base("One or more validation errors occurred.", DefaultErrorCode)
    {
        Errors = errors.AsReadOnly();
    }

    public ValidationException(string fieldName, string errorMessage)
        : base($"Validation failed for '{fieldName}': {errorMessage}", DefaultErrorCode)
    {
        Errors = new Dictionary<string, string[]>
        {
            { fieldName, [errorMessage] }
        };
    }

    public static ValidationException RequiredField(string fieldName)
        => new(fieldName, $"{fieldName} is required.");

    public static ValidationException InvalidFormat(string fieldName, string expectedFormat)
        => new(fieldName, $"{fieldName} has an invalid format. Expected: {expectedFormat}");
}