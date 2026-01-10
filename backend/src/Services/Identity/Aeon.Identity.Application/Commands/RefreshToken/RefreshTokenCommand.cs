using Aeon.BuildingBlocks.CQRS.Commands;
using Aeon.Identity.Application.DTOs;

namespace Aeon. Identity.Application.Commands.RefreshToken;

// Command to refresh an access token using a refresh token.
public sealed class RefreshTokenCommand: ICommand<AuthResult>
{
    // The refresh token. 
    public required string RefreshToken { get; init; }

    // IP address of the request.
    public string? IpAddress { get; init; }

    // User agent of the request. 
    public string? UserAgent { get; init; }
}