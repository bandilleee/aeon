using Aeon.BuildingBlocks.CQRS.Commands;
using Aeon.Common.Kernel.Exceptions;
using Aeon.Identity.Application.DTOs;
using Aeon.Identity.Application.Interfaces;
using Aeon.Identity.Domain.Entities;
using Aeon.Identity.Domain.Repositories;

namespace Aeon.Identity.Application.Commands.TwoFactor.Setup;

public sealed class Setup2FACommandHandler : ICommandHandler<Setup2FACommand, TwoFactorSetupResult>
{
    private readonly IUserRepository _userRepository;
    private readonly ITotpService _totpService;
    private readonly IUnitOfWork _unitOfWork;

    public Setup2FACommandHandler(
        IUserRepository userRepository,
        ITotpService totpService,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _totpService = totpService;
        _unitOfWork = unitOfWork;
    }

    public async Task<TwoFactorSetupResult> Handle(Setup2FACommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken)
            ?? throw NotFoundException.ForEntity<User>(request.UserId);

        if (user.TwoFactorEnabled)
        {
            throw new ValidationException("TwoFactor", "Two-factor authentication is already enabled.");
        }

        var secret = _totpService.GenerateSecret();
        var qrCodeUri = _totpService.GenerateQrCodeUri(user.Email, secret);

        user.SetupTwoFactor(secret);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new TwoFactorSetupResult
        {
            Secret = secret,
            QrCodeUri = qrCodeUri
        };
    }
}