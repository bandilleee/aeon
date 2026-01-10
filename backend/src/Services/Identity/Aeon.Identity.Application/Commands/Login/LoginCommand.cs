using Aeon.BuildingBlocks.CQRS.Commands;
using Aeon.Identity.Application.DTOs;

namespace Aeon.Identity.Application.Commands.Login;


public sealed class LoginCommand : ICommand<LoginResult>
{
    public required string Email { get; init; }

    public required string Password { get; init; }

    public bool RememberMe { get; init; }

    public string? IpAddress { get; init; }

    public string? UserAgent { get; init; }
}