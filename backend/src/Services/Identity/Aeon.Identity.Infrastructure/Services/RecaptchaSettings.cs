namespace Aeon.Identity.Infrastructure.Services;

public sealed class RecaptchaSettings
{
    public const string SectionName = "Recaptcha";

    // Whether reCAPTCHA validation is enabled.
    // Set to false for development/testing. 
    public bool Enabled { get; init; } = true;

    public string SiteKey { get; init; } = string.Empty;

    public string SecretKey { get; init; } = string.Empty;

    public double MinimumScore { get; init; } = 0.5;

    public string VerifyUrl { get; init; } = "https://www.google.com/recaptcha/api/siteverify";
}