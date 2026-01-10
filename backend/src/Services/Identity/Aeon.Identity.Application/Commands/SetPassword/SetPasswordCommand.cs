using Aeon.BuildingBlocks.CQRS.Commands;
using Aeon.Identity.Application.DTOs;

namespace Aeon.Identity.Application.Commands.SetPassword;

// Command to set a new password (replacing temporary password).
public sealed class SetPasswordCommand: ICommand<AuthResult>
{
    //The ID of the authenticated user.
    public required Guid UserId { get; init; }

    /// The new password.
    public required string NewPassword { get; init; }


    /// Confirmation of the new password.
    public required string ConfirmPassword { get; init; }

    /// IP address of the request. 
    public string? IpAddress { get; init; }

    /// User agent of the request.
    public string? UserAgent { get; init; }
}