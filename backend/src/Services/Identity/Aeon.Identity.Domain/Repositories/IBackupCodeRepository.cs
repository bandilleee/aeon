using Aeon.Identity.Domain.Entities;

namespace Aeon.Identity.Domain.Repositories;

public interface IBackupCodeRepository
{
    Task<IReadOnlyList<BackupCode>> GetValidCodesByUserIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<BackupCode?> GetByCodeHashAsync(
        Guid userId,
        string codeHash,
        CancellationToken cancellationToken = default);

    Task AddRangeAsync(
        IEnumerable<BackupCode> backupCodes,
        CancellationToken cancellationToken = default);

    Task UpdateAsync(
        BackupCode backupCode,
        CancellationToken cancellationToken = default);

    Task DeleteAllByUserIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<int> CountValidCodesByUserIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default);
}