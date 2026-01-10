using Aeon.Identity.Domain.Entities;

namespace Aeon.Identity.Application.Interfaces;

/// Interface for JWT token operations.
public interface IJwtService
{
    /// Generates an access token for a user.
    string GenerateAccessToken(User user);

    string GenerateRefreshToken();

    /// Gets the configured access token expiry time.
    TimeSpan AccessTokenExpiry { get; }

    /// Gets the configured refresh token expiry time.
    TimeSpan RefreshTokenExpiry { get; }
}