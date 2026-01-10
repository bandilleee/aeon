using Aeon.BuildingBlocks.CQRS.Commands;
using Aeon.Identity.Application.DTOs;

namespace Aeon.Identity.Application.Commands.TwoFactor.Setup;

public sealed class Setup2FACommand : ICommand<TwoFactorSetupResult>
{
    public required Guid UserId { get; init; }
}