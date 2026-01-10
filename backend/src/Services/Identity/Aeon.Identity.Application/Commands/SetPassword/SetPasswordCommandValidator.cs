using Aeon.Identity.Domain.ValueObjects;
using FluentValidation;

namespace Aeon.Identity.Application.Commands.SetPassword;

// Validator for SetPasswordCommand.
public sealed class SetPasswordCommandValidator: AbstractValidator<SetPasswordCommand>
{
    // Initializes validation rules for setting password.
    public SetPasswordCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required.");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("New password is required.")
            .MinimumLength(Password.MinLength)
                .WithMessage($"Password must be at least {Password.MinLength} characters.")
            .MaximumLength(Password.MaxLength)
                .WithMessage($"Password must not exceed {Password.MaxLength} characters.")
            .Must(BeAValidPassword).WithMessage("Password does not meet security requirements.");

        RuleFor(x => x.ConfirmPassword)
            .NotEmpty().WithMessage("Please confirm your password.")
            .Equal(x => x.NewPassword).WithMessage("Passwords don't match.");
    }

    private static bool BeAValidPassword(string password)
    {
        return Password.IsValid(password);
    }
}