using FluentValidation;

namespace Aeon.Identity.Application.Commands.RefreshToken;

// Validator for RefreshTokenCommand. 
public sealed class RefreshTokenCommandValidator: AbstractValidator<RefreshTokenCommand>
{
    // Initializes validation rules for token refresh.
    public RefreshTokenCommandValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty().WithMessage("Refresh token is required.");
    }
}