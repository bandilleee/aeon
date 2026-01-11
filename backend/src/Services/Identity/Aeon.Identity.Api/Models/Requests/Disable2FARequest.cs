namespace Aeon.Identity.Api.Models.Requests;

public sealed class Disable2FARequest
{
    public string Password { get; init; } = string.Empty;
}