namespace Aeon.Identity.Domain.Repositories;

using Aeon.Identity.Domain.Entities;

/// Repository interface for User entity operations.
public interface IUserRepository
{
    /// Gets a user by their ID.
    Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    // Gets a user by their email address.
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);

    // Checks if an email is already registered.
    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default);

    // Adds a new user to the repository. 
    Task AddAsync(User user, CancellationToken cancellationToken = default);

    // Updates an existing user. 
    Task UpdateAsync(User user, CancellationToken cancellationToken = default);
}