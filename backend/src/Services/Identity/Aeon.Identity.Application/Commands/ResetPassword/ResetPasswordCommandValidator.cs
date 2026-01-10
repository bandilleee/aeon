using Aeon.Identity.Domain.ValueObjects;
using FluentValidation;

namespace Aeon.Identity.Application.Commands.ResetPassword;

// Validator for ResetPasswordCommand. 
public sealed class ResetPasswordCommandValidator: AbstractValidator<ResetPasswordCommand>
{
    // Initializes validation rules for password reset.
    public ResetPasswordCommandValidator()
    {
        RuleFor(x => x.Token)
            .NotEmpty().WithMessage("Reset token is required.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Please enter a valid email address.");

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