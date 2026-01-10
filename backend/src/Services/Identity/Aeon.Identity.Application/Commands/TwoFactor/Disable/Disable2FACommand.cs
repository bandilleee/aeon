using Aeon.BuildingBlocks.CQRS.Commands;

namespace Aeon.Identity.Application.Commands.TwoFactor.Disable;

public sealed class Disable2FACommand : ICommand
{
    public required Guid UserId { get; init; }
    /// The user's current password for verification.
    /// </summary>
    public required string Password { get; init; }
}