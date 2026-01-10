using Aeon.Identity.Application.Interfaces;

namespace Aeon.Identity.Infrastructure.Services;

// BCrypt password hasher implementation.
public sealed class PasswordHasher : IPasswordHasher
{
    // Work factor - higher = more secure but slower
    // 12 is a good balance for 2024+ hardware
    private const int WorkFactor = 12;

    public string Hash(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);
    }

    public bool Verify(string password, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }
}