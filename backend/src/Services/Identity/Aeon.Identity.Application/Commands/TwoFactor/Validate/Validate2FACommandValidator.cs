using FluentValidation;

namespace Aeon.Identity.Application.Commands.TwoFactor.Validate;

public sealed class Validate2FACommandValidator : AbstractValidator<Validate2FACommand>
{
    public Validate2FACommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required.");

        RuleFor(x => x. Code)
            .NotEmpty().WithMessage("Verification code is required.")
            .Length(6).WithMessage("Code must be 6 digits.")
            .Matches(@"^\d+$").WithMessage("Code must contain only numbers.");
    }
}