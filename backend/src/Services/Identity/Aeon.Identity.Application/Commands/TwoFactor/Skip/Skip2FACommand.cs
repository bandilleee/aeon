using Aeon.BuildingBlocks.CQRS.Commands;

namespace Aeon.Identity.Application.Commands.TwoFactor.Skip;

public sealed class Skip2FACommand : ICommand
{
    public required Guid UserId { get; init; }
}