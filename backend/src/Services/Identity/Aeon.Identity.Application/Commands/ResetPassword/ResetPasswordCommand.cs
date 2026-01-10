using Aeon.BuildingBlocks.CQRS.Commands;

namespace Aeon.Identity.Application.Commands.ResetPassword;

// Command to reset password using a reset token.
public sealed class ResetPasswordCommand: ICommand
{
    // The password reset token from the email.
    public required string Token { get; init; }

    // The user's email address.
    public required string Email { get; init; }

    // The new password.
    public required string NewPassword { get; init; }

    // Confirmation of the new password. 
    public required string ConfirmPassword { get; init; }
}