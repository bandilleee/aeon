using Aeon.BuildingBlocks.CQRS.Commands;
using Aeon.Identity.Application.DTOs;

namespace Aeon.Identity.Application.Commands.TwoFactor.Verify;

public sealed class Verify2FACommand : ICommand<BackupCodesResult>
{
    public required Guid UserId { get; init; }
    public required string Code { get; init; }
}