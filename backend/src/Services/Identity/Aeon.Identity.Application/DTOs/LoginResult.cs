namespace Aeon.Identity.Application.DTOs;

public sealed class LoginResult
{
    public bool Requires2FA { get; init; }

    public Guid? TwoFactorUserId { get; init; }

    public AuthResult? AuthResult { get; init; }

    public static LoginResult RequiresTwoFactor(Guid userId) => new()
    {
        Requires2FA = true,
        TwoFactorUserId = userId
    };

    public static LoginResult Success(AuthResult authResult) => new()
    {
        Requires2FA = false,
        AuthResult = authResult
    };
}