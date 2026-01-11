namespace Aeon.Identity.Api.Models.Requests;

public sealed class Validate2FARequest
{
    public Guid UserId { get; init; }

    public string Code { get; init; } = string.Empty;

    public bool RememberMe { get; init; }
}