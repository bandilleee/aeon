namespace Aeon.Identity.Application.DTOs;

/// Result of a successful authentication.
public sealed class AuthResult
{
    /// The JWT access token.
    public required string AccessToken { get; init; }

    /// The refresh token for obtaining new access tokens.
    public required string RefreshToken { get; init; }

    /// When the access token expires.
    public required DateTime AccessTokenExpiry { get; init; }

    /// Information about the authenticated user.
    public required UserDto User { get; init; }
}