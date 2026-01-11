namespace Aeon.Identity.Api.Models.Requests;

public sealed class RefreshTokenRequest
{
    public string RefreshToken { get; init; } = string.Empty;
}