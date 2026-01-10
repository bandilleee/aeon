namespace Aeon.Identity.Infrastructure.Services;

/// JWT configuration settings.
public sealed class JwtSettings
{
    public const string SectionName = "Jwt";

    // Secret key for signing tokens.
    public string Secret { get; init; } = string.Empty;

    // Token issuer.
    public string Issuer { get; init; } = string. Empty;

    // Token audience.
    public string Audience { get; init; } = string.Empty;

    public int AccessTokenExpiryMinutes { get; init; } = 15;

    public int RefreshTokenExpiryDays { get; init; } = 7;
}