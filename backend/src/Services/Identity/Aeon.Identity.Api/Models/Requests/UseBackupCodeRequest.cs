namespace Aeon.Identity.Api.Models.Requests;

public sealed class UseBackupCodeRequest
{
    public Guid UserId { get; init; }
    public string BackupCode { get; init; } = string.Empty;
    public bool RememberMe { get; init; }
}