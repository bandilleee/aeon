using FluentValidation;

namespace Aeon.Identity.Application.Commands.TwoFactor.Verify;

public sealed class Verify2FACommandValidator : AbstractValidator<Verify2FACommand>
{
    public Verify2FACommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required.");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Verification code is required.")
            .Length(6).WithMessage("Code must be 6 digits.")
            . Matches(@"^\d+$").WithMessage("Code must contain only numbers.");
    }
}