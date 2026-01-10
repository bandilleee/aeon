namespace Aeon.Identity.Application.DTOs;

public sealed class UserDto
{
    public required Guid Id { get; init; }
    public required string Email { get; init; }
    public required string FirstName { get; init; }
    public required string LastName { get; init; }
    public required string FullName { get; init; }
    public required string Role { get; init; }
    public required bool RequiresPasswordChange { get; init; }
    public required bool TwoFactorEnabled { get; init; }
    public required bool ShouldPromptFor2FASetup { get; init; }
}