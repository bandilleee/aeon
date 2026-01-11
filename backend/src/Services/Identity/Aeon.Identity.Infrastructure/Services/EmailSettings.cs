namespace Aeon.Identity.Infrastructure.Services;

public sealed class EmailSettings
{
    public const string SectionName = "Email";

    public bool Enabled { get; init; }

    public string SmtpHost { get; init; } = "localhost";

    public int SmtpPort { get; init; } = 587;

    public string SmtpUsername { get; init; } = string.Empty;

    public string SmtpPassword { get; init; } = string.Empty;

    public bool UseSsl { get; init; } = true;

    public string FromEmail { get; init; } = "noreply@aeon.local";

    public string FromName { get; init; } = "Aeon";

    public string FrontendBaseUrl { get; init; } = "http://localhost:3000";
}