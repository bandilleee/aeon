using FluentValidation;

namespace Aeon.Identity.Application.Commands.ForgotPassword;

// Validator for ForgotPasswordCommand. 
public sealed class ForgotPasswordCommandValidator: AbstractValidator<ForgotPasswordCommand>
{
    /// Initializes validation rules for forgot password.
    public ForgotPasswordCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Please enter a valid email address.")
            .MaximumLength(256).WithMessage("Email must not exceed 256 characters.");
    }
}