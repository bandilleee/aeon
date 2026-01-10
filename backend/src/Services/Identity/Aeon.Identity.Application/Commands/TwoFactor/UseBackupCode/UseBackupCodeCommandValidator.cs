using FluentValidation;

namespace Aeon.Identity.Application.Commands.TwoFactor.UseBackupCode;


public sealed class UseBackupCodeCommandValidator : AbstractValidator<UseBackupCodeCommand>
{
    public UseBackupCodeCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required.");

        RuleFor(x => x.BackupCode)
            .NotEmpty().WithMessage("Backup code is required.");
    }
}