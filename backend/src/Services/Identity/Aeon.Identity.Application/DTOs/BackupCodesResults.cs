namespace Aeon.Identity.Application.DTOs;

public sealed class BackupCodesResult
{
    public required IReadOnlyList<string> Codes { get; init; }
    public required DateTime GeneratedAt { get; init; }
}