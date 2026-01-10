using Aeon.BuildingBlocks.CQRS.Commands;
using Aeon.Common.Kernel.Exceptions;
using Aeon.Identity.Application.DTOs;
using Aeon.Identity.Application.DTOs.Mappings;
using Aeon.Identity.Application.Interfaces;
using Aeon.Identity.Domain.Entities;
using Aeon.Identity.Domain.Repositories;
using RefreshTokenEntity = Aeon.Identity.Domain.Entities.RefreshToken;

namespace Aeon.Identity.Application.Commands.TwoFactor.UseBackupCode;

public sealed class UseBackupCodeCommandHandler : ICommandHandler<UseBackupCodeCommand, AuthResult>
{
    private readonly IUserRepository _userRepository;
    private readonly IBackupCodeRepository _backupCodeRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IJwtService _jwtService;
    private readonly ITokenHasher _tokenHasher;
    private readonly IUnitOfWork _unitOfWork;

    public UseBackupCodeCommandHandler(
        IUserRepository userRepository,
        IBackupCodeRepository backupCodeRepository,
        IRefreshTokenRepository refreshTokenRepository,
        IJwtService jwtService,
        ITokenHasher tokenHasher,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _backupCodeRepository = backupCodeRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _jwtService = jwtService;
        _tokenHasher = tokenHasher;
        _unitOfWork = unitOfWork;
    }

    public async Task<AuthResult> Handle(UseBackupCodeCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken)
            ?? throw NotFoundException.ForEntity<User>(request.UserId);

        if (!user.TwoFactorEnabled)
        {
            throw new ValidationException("TwoFactor", "Two-factor authentication is not enabled.");
        }

        var codeHash = _tokenHasher.Hash(NormalizeBackupCode(request.BackupCode));
        var backupCode = await _backupCodeRepository.GetByCodeHashAsync(user.Id, codeHash, cancellationToken);

        if (backupCode is null || !backupCode.IsValid)
        {
            user.RecordFailedLogin();
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            throw new UnauthorizedException("Invalid or already used backup code.", "INVALID_BACKUP_CODE");
        }

        backupCode.MarkAsUsed();

        user.RecordSuccessfulLogin(request.IpAddress, request.UserAgent);

        var accessToken = _jwtService.GenerateAccessToken(user);
        var refreshToken = _jwtService.GenerateRefreshToken();
        var refreshTokenHash = _tokenHasher.Hash(refreshToken);

        var refreshExpiry = request.RememberMe
            ? DateTime.UtcNow.AddDays(30)
            : DateTime.UtcNow.Add(_jwtService.RefreshTokenExpiry);

        var refreshTokenEntity = RefreshTokenEntity.Create(
            refreshTokenHash,
            user.Id,
            refreshExpiry,
            request.IpAddress,
            request.UserAgent);

        await _refreshTokenRepository.AddAsync(refreshTokenEntity, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new AuthResult
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            AccessTokenExpiry = DateTime.UtcNow.Add(_jwtService.AccessTokenExpiry),
            User = user.ToDto()
        };
    }

    private static string NormalizeBackupCode(string code)
    {
        return code.Replace("-", "").ToUpperInvariant();
    }
}