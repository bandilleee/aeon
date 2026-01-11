namespace Aeon.Identity.Api.Models.Requests;

public sealed class ResetPasswordRequest
{
    public string Token { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string NewPassword { get; init; } = string.Empty;
    public string ConfirmPassword { get; init; } = string.Empty;
    public string? RecaptchaToken { get; init; }
}