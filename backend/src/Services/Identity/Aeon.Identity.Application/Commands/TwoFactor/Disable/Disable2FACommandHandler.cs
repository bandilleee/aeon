using Aeon.BuildingBlocks.CQRS.Commands;
using Aeon.Common.Kernel.Exceptions;
using Aeon.Identity.Application.Interfaces;
using Aeon.Identity.Domain.Entities;
using Aeon.Identity.Domain.Repositories;

namespace Aeon.Identity.Application.Commands.TwoFactor.Disable;

public sealed class Disable2FACommandHandler : ICommandHandler<Disable2FACommand>
{
    private readonly IUserRepository _userRepository;
    private readonly IBackupCodeRepository _backupCodeRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IUnitOfWork _unitOfWork;

    public Disable2FACommandHandler(
        IUserRepository userRepository,
        IBackupCodeRepository backupCodeRepository,
        IPasswordHasher passwordHasher,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _backupCodeRepository = backupCodeRepository;
        _passwordHasher = passwordHasher;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(Disable2FACommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken)
            ?? throw NotFoundException.ForEntity<User>(request.UserId);

        if (!user.TwoFactorEnabled)
        {
            throw new ValidationException("TwoFactor", "Two-factor authentication is not enabled.");
        }

        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            throw UnauthorizedException.InvalidCredentials();
        }

        user.DisableTwoFactor();

        await _backupCodeRepository.DeleteAllByUserIdAsync(user.Id, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}