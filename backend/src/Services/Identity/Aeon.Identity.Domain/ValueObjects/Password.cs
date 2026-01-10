using Aeon.Common.Kernel.Exceptions;

namespace Aeon.Identity.Domain.ValueObjects;
public static class Password
{
    public const int MinLength = 8;

    public const int MaxLength = 128;

    public static void Validate(string password)
    {
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(password))
        {
            errors. Add("Password", ["Password is required."]);
            throw new ValidationException(errors);
        }

        var validationErrors = new List<string>();

        if (password.Length < MinLength)
        {
            validationErrors.Add($"Password must be at least {MinLength} characters.");
        }

        if (password.Length > MaxLength)
        {
            validationErrors.Add($"Password must not exceed {MaxLength} characters.");
        }

        if (!password.Any(char.IsUpper))
        {
            validationErrors.Add("Password must contain at least one uppercase letter.");
        }

        if (!password.Any(char.IsLower))
        {
            validationErrors.Add("Password must contain at least one lowercase letter.");
        }

        if (!password.Any(char.IsDigit))
        {
            validationErrors.Add("Password must contain at least one number.");
        }

        if (!password.Any(c => ! char.IsLetterOrDigit(c)))
        {
            validationErrors.Add("Password must contain at least one special character.");
        }

        if (validationErrors.Count > 0)
        {
            errors.Add("Password", [..validationErrors]);
            throw new ValidationException(errors);
        }
    }

    public static bool IsValid(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
            return false;

        if (password.Length < MinLength || password.Length > MaxLength)
            return false;

        if (! password.Any(char.IsUpper))
            return false;

        if (!password.Any(char.IsLower))
            return false;

        if (!password.Any(char.IsDigit))
            return false;

        if (!password.Any(c => ! char.IsLetterOrDigit(c)))
            return false;

        return true;
    }
}