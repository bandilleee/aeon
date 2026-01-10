using Aeon.Identity.Domain.Entities;
using Aeon.Identity.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Aeon.Identity.Infrastructure.Persistence.Repositories;

public sealed class BackupCodeRepository : IBackupCodeRepository
{
    private readonly IdentityDbContext _dbContext;

    public BackupCodeRepository(IdentityDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<BackupCode>> GetValidCodesByUserIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.BackupCodes
            .Where(bc => bc.UserId == userId && !bc.IsUsed)
            .ToListAsync(cancellationToken);
    }

    public async Task<BackupCode?> GetByCodeHashAsync(
        Guid userId,
        string codeHash,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.BackupCodes
            .FirstOrDefaultAsync(
                bc => bc.UserId == userId && bc.CodeHash == codeHash,
                cancellationToken);
    }

    public async Task AddRangeAsync(
        IEnumerable<BackupCode> backupCodes,
        CancellationToken cancellationToken = default)
    {
        await _dbContext.BackupCodes.AddRangeAsync(backupCodes, cancellationToken);
    }

    public Task UpdateAsync(BackupCode backupCode, CancellationToken cancellationToken = default)
    {
        _dbContext.BackupCodes.Update(backupCode);
        return Task.CompletedTask;
    }

    public async Task DeleteAllByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var codes = await _dbContext.BackupCodes
            .Where(bc => bc.UserId == userId)
            .ToListAsync(cancellationToken);

        _dbContext.BackupCodes.RemoveRange(codes);
    }

    public async Task<int> CountValidCodesByUserIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.BackupCodes
            .CountAsync(bc => bc.UserId == userId && !bc.IsUsed, cancellationToken);
    }
}