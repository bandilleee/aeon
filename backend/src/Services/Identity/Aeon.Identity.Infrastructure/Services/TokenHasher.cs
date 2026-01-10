using Aeon.Identity.Application.Interfaces;
using System.Security.Cryptography;
using System.Text;

namespace Aeon.Identity.Infrastructure.Services;

// SHA256 token hasher for refresh tokens and backup codes.
public sealed class TokenHasher : ITokenHasher
{
    public string Hash(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}