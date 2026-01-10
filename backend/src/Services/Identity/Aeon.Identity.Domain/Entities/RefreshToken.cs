using Aeon.Common.Kernel.Domain;
using Aeon.Common.Kernel.Exceptions;

namespace Aeon.Identity.Domain.Entities;

// Represents a refresh token for JWT token rotation.
public sealed class RefreshToken: BaseEntity
{
    // The refresh token value (hashed for security).
    public string TokenHash { get; private set; } = string.Empty;

    // The ID of the user this token belongs to.
    public Guid UserId { get; private set; }

    // When the token expires.
    public DateTime ExpiresAt { get; private set; }

    // Whether the token has been revoked.
    public bool IsRevoked { get; private set; }

    // When the token was revoked (null if not revoked).
    public DateTime? RevokedAt { get; private set; }

    // The token that replaced this one (for token rotation).
    public string? ReplacedByTokenHash { get; private set; }

    // IP address from which the token was created.
    public string? CreatedFromIp { get; private set; }

    // User agent from which the token was created.
    public string? CreatedFromUserAgent { get; private set; }

    // Private constructor for EF Core.
    private RefreshToken() { }

    // Creates a new refresh token. 
    public static RefreshToken Create(
        string tokenHash,
        Guid userId,
        DateTime expiresAt,
        string? ipAddress = null,
        string? userAgent = null)
    {
        if (string.IsNullOrWhiteSpace(tokenHash))
        {
            throw new ValidationException("TokenHash", "Token hash is required.");
        }

        if (userId == Guid.Empty)
        {
            throw new ValidationException("UserId", "User ID is required.");
        }

        if (expiresAt <= DateTime.UtcNow)
        {
            throw new ValidationException("ExpiresAt", "Expiry must be in the future.");
        }

        return new RefreshToken
        {
            TokenHash = tokenHash,
            UserId = userId,
            ExpiresAt = expiresAt,
            CreatedFromIp = ipAddress,
            CreatedFromUserAgent = userAgent
        };
    }

    // Checks if the token is still valid (not expired and not revoked).
    public bool IsActive => ! IsRevoked && DateTime.UtcNow < ExpiresAt;

    public void Revoke(string? replacedByTokenHash = null)
    {
        IsRevoked = true;
        RevokedAt = DateTime.UtcNow;
        ReplacedByTokenHash = replacedByTokenHash;
    }
}