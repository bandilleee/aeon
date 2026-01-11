namespace Aeon.Identity.Infrastructure.Services;

// Email configuration settings for the Identity service.
public sealed class EmailSettings
{
    public const string SectionName = "Email";

    // Gets a value indicating whether email sending is enabled.
    // If false, emails may be logged rather than sent.
    public bool Enabled { get; init; }

    public string SmtpHost { get; init; } = "smtp.gmail.com";

    public int SmtpPort { get; init; } = 587;

    public string SmtpUsername { get; init; } = "noreply.gkssjoburg@gmail.com";

    // SMTP password or App Password for the mail server.
    public string SmtpPassword { get; init; } = string.Empty;

    public bool UseSsl { get; init; } = true;

    public string FromEmail { get; init; } = "noreply.gkssjoburg@gmail.com";

    public string FromName { get; init; } = "Aeon";

    // Base URL for the frontend application used to construct links.
    public string FrontendBaseUrl { get; init; } = "http://localhost:3000";
}