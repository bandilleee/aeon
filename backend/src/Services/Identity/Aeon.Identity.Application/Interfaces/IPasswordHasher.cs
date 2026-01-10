namespace Aeon.Identity.Application.Interfaces;

// Interface for password hashing operations.
public interface IPasswordHasher
{
    // Hashes a plain-text password using BCrypt.
    string Hash(string password);

    // Verifies a plain-text password against a hash.
    bool Verify(string password, string hash);
}