using Aeon.BuildingBlocks.CQRS.Commands;

namespace Aeon.Identity.Application.Commands.ForgotPassword;

// Command to request a password reset email.
public sealed class ForgotPasswordCommand: ICommand
{
    // The email address to send the reset link to.
    public required string Email { get; init; }
}