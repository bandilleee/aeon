namespace Aeon.Common.Kernel.Exceptions;
public sealed class UnauthorizedException : DomainException
{
    private const string DefaultErrorCode = "UNAUTHORIZED";
    private const string DefaultMessage = "Authentication is required to access this resource.";

    public UnauthorizedException()
        : base(DefaultMessage, DefaultErrorCode)
    {
    }

    public UnauthorizedException(string message)
        : base(message, DefaultErrorCode)
    {
    }

    public UnauthorizedException(string message, string errorCode)
        : base(message, errorCode)
    {
    }

    public static UnauthorizedException InvalidCredentials()
        => new("The provided credentials are invalid.", "INVALID_CREDENTIALS");

    public static UnauthorizedException TokenExpired()
        => new("The authentication token has expired.", "TOKEN_EXPIRED");

    public static UnauthorizedException InvalidToken()
        => new("The authentication token is invalid.", "INVALID_TOKEN");
}