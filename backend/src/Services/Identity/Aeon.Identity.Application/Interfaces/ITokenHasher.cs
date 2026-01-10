namespace Aeon.Identity.Application.Interfaces;

// Interface for hashing tokens (refresh tokens, reset tokens).
// Uses SHA256 for fast, secure hashing (not BCrypt - tokens are already random).
public interface ITokenHasher
{
    /// Hashes a token using SHA256.
    string Hash(string token);
}