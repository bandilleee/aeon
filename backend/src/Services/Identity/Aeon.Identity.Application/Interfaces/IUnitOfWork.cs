namespace Aeon.Identity.Application.Interfaces;

/// Unit of Work pattern for managing transactions.
public interface IUnitOfWork
{
    /// Saves all changes made in this unit of work.
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}