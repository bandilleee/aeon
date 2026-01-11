namespace Aeon.Identity.Api.Models.Requests;

public sealed class LoginRequest
{
    public string Email { get; init; } = string.Empty;

    public string Password { get; init; } = string.Empty;

    public bool RememberMe { get; init; }
    
    public string? RecaptchaToken { get; init; }
}