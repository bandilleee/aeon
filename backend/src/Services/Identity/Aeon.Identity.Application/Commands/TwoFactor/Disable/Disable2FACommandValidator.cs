using FluentValidation;

namespace Aeon.Identity.Application.Commands.TwoFactor.Disable;

public sealed class Disable2FACommandValidator : AbstractValidator<Disable2FACommand>
{
    public Disable2FACommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required to disable 2FA.");
    }
}