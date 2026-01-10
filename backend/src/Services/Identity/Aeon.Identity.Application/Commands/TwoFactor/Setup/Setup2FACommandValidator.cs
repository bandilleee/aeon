using FluentValidation;

namespace Aeon.Identity.Application.Commands.TwoFactor.Setup;

public sealed class Setup2FACommandValidator : AbstractValidator<Setup2FACommand>
{
    public Setup2FACommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required.");
    }
}