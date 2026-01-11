namespace Aeon.Identity.Api.Models.Requests;

public sealed class SetPasswordRequest
{
    public string NewPassword { get; init; } = string.Empty;
    public string ConfirmPassword { get; init; } = string.Empty;
}