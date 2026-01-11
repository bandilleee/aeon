namespace Aeon.Identity.Api.Models.Requests;

public sealed class ForgotPasswordRequest
{
    public string Email { get; init; } = string.Empty;
    public string? RecaptchaToken { get; init; }
}