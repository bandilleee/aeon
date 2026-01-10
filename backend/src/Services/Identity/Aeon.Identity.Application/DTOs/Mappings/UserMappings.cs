using Aeon.Identity.Domain.Entities;

namespace Aeon.Identity.Application.DTOs.Mappings;

public static class UserMappings
{
    public static UserDto ToDto(this User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = user.FullName,
            Role = user. Role. ToString().ToLowerInvariant(),
            RequiresPasswordChange = user.RequiresPasswordChange,
            TwoFactorEnabled = user.TwoFactorEnabled,
            ShouldPromptFor2FASetup = user.ShouldPromptFor2FASetup
        };
    }
}