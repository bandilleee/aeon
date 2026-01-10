namespace Aeon.Identity.Infrastructure.Services;

// TOTP configuration settings.
public sealed class TotpSettings
{
    public const string SectionName = "Totp";

    // Issuer name shown in authenticator apps.
    public string Issuer { get; init; } = "Aeon";

    // Number of backup codes to generate.
    public int BackupCodeCount { get; init; } = 10;
}