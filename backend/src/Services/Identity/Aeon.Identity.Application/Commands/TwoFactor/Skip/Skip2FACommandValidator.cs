using FluentValidation;

namespace Aeon.Identity.Application.Commands.TwoFactor.Skip;

public sealed class Skip2FACommandValidator : AbstractValidator<Skip2FACommand>
{
    public Skip2FACommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required.");
    }
}