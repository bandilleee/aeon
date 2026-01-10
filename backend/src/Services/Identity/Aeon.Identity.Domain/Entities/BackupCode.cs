using Aeon.Common.Kernel.Domain;
using Aeon.Common.Kernel.Exceptions;

namespace Aeon.Identity.Domain.Entities;

public sealed class BackupCode : BaseEntity
{
    public string CodeHash { get; private set; } = string.Empty;
    public Guid UserId { get; private set; }
    public bool IsUsed { get; private set; }
    public DateTime? UsedAt { get; private set; }

    private BackupCode() { }

    public static BackupCode Create(string codeHash, Guid userId)
    {
        if (string.IsNullOrWhiteSpace(codeHash))
        {
            throw new ValidationException("CodeHash", "Code hash is required.");
        }

        if (userId == Guid.Empty)
        {
            throw new ValidationException("UserId", "User ID is required.");
        }

        return new BackupCode
        {
            CodeHash = codeHash,
            UserId = userId,
            IsUsed = false
        };
    }

    public void MarkAsUsed()
    {
        if (IsUsed)
        {
            throw new ValidationException("BackupCode", "This backup code has already been used.");
        }

        IsUsed = true;
        UsedAt = DateTime.UtcNow;
    }

    public bool IsValid => !IsUsed;
}