using FluentValidation;

namespace Aeon.Identity.Application.Commands.Login;

/// Validator for LoginCommand.
public sealed class LoginCommandValidator: AbstractValidator<LoginCommand>
{
    /// Initializes validation rules for login. 
    public LoginCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Please enter a valid email address.")
            .MaximumLength(256).WithMessage("Email must not exceed 256 characters.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MaximumLength(128).WithMessage("Password must not exceed 128 characters.");
    }
}