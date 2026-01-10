using Aeon.BuildingBlocks.CQRS.Commands;
using Aeon.Identity.Application.DTOs;

namespace Aeon.Identity.Application.Commands.TwoFactor.Validate;

public sealed class Validate2FACommand :  ICommand<AuthResult>
{

    public required Guid UserId { get; init; }
    public required string Code { get; init; }
    public string? IpAddress { get; init; }
    public string?  UserAgent { get; init; }
    public bool RememberMe { get; init; }
}