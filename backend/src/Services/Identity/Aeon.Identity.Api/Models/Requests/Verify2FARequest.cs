namespace Aeon.Identity.Api.Models.Requests;

public sealed class Verify2FARequest
{
    public string Code { get; init; } = string.Empty;
}