namespace Aeon.Identity.Domain.Repositories;

using Aeon.Identity.Domain.Entities;

// Repository interface for RefreshToken entity operations.
public interface IRefreshTokenRepository
{
    // Gets a refresh token by its hash.
    Task<RefreshToken?> GetByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default);

    // Gets all active refresh tokens for a user.
    Task<IReadOnlyList<RefreshToken>> GetActiveTokensByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);

    // Adds a new refresh token.
    Task AddAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default);

    // Updates an existing refresh token. 
    Task UpdateAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default);

    // Revokes all refresh tokens for a user.
    Task RevokeAllByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
}