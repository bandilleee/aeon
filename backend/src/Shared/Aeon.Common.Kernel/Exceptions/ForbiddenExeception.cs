namespace Aeon.Common.Kernel.Exceptions;

public sealed class ForbiddenException: DomainException
{
    private const string DefaultErrorCode = "FORBIDDEN";
    private const string DefaultMessage = "You do not have permission to perform this action.";


    public string? AttemptedAction { get; }


    public string? Resource { get; }


    public ForbiddenException()
        : base(DefaultMessage, DefaultErrorCode)
    {
    }

    public ForbiddenException(string message)
        : base(message, DefaultErrorCode)
    {
    }


    public ForbiddenException(string action, string resource)
        : base($"You do not have permission to {action} on {resource}.", DefaultErrorCode)
    {
        AttemptedAction = action;
        Resource = resource;
    }

    public static ForbiddenException InsufficientRole(string requiredRole)
        => new($"This action requires the '{requiredRole}' role.");

    public static ForbiddenException NotOwner(string resource)
        => new($"You must be the owner of this {resource} to perform this action.");
}