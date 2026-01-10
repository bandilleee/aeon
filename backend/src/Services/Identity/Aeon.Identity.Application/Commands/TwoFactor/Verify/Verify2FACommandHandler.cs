using Aeon.BuildingBlocks.CQRS.Commands;
using Aeon.Common.Kernel.Exceptions;
using Aeon.Identity.Application.DTOs;
using Aeon.Identity.Application.Interfaces;
using Aeon.Identity.Domain.Entities;
using Aeon.Identity.Domain.Repositories;

namespace Aeon.Identity.Application.Commands.TwoFactor.Verify;

public sealed class Verify2FACommandHandler : ICommandHandler<Verify2FACommand, BackupCodesResult>
{
    private readonly IUserRepository _userRepository;
    private readonly IBackupCodeRepository _backupCodeRepository;
    private readonly ITotpService _totpService;
    private readonly ITokenHasher _tokenHasher;
    private readonly IUnitOfWork _unitOfWork;

    public Verify2FACommandHandler(
        IUserRepository userRepository,
        IBackupCodeRepository backupCodeRepository,
        ITotpService totpService,
        ITokenHasher tokenHasher,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _backupCodeRepository = backupCodeRepository;
        _totpService = totpService;
        _tokenHasher = tokenHasher;
        _unitOfWork = unitOfWork;
    }

    public async Task<BackupCodesResult> Handle(Verify2FACommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken)
            ?? throw NotFoundException.ForEntity<User>(request.UserId);

        if (user.TwoFactorEnabled)
        {
            throw new ValidationException("TwoFactor", "Two-factor authentication is already enabled.");
        }

        if (string.IsNullOrWhiteSpace(user.TwoFactorSecret))
        {
            throw new ValidationException("TwoFactor", "Two-factor setup has not been initiated.");
        }

        if (!_totpService.ValidateCode(user.TwoFactorSecret, request.Code))
        {
            throw new ValidationException("Code", "Invalid verification code. Please try again.");
        }

        user.EnableTwoFactor();

        var backupCodes = _totpService.GenerateBackupCodes(10);

        await _backupCodeRepository.DeleteAllByUserIdAsync(user.Id, cancellationToken);

        var backupCodeEntities = backupCodes.Select(code =>
            BackupCode.Create(_tokenHasher.Hash(code), user.Id));

        await _backupCodeRepository.AddRangeAsync(backupCodeEntities, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new BackupCodesResult
        {
            Codes = backupCodes,
            GeneratedAt = DateTime.UtcNow
        };
    }
}