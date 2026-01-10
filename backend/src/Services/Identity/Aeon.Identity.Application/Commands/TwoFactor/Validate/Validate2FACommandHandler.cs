using Aeon.BuildingBlocks.CQRS.Commands;
using Aeon.Common.Kernel.Exceptions;
using Aeon.Identity.Application.DTOs;
using Aeon.Identity.Application.DTOs.Mappings;
using Aeon.Identity.Application.Interfaces;
using Aeon.Identity.Domain.Entities;
using Aeon.Identity.Domain.Repositories;
using RefreshTokenEntity = Aeon.Identity.Domain.Entities.RefreshToken;

namespace Aeon.Identity.Application.Commands.TwoFactor.Validate;

public sealed class Validate2FACommandHandler : ICommandHandler<Validate2FACommand, AuthResult>
{
    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly ITotpService _totpService;
    private readonly IJwtService _jwtService;
    private readonly ITokenHasher _tokenHasher;
    private readonly IUnitOfWork _unitOfWork;

    public Validate2FACommandHandler(
        IUserRepository userRepository,
        IRefreshTokenRepository refreshTokenRepository,
        ITotpService totpService,
        IJwtService jwtService,
        ITokenHasher tokenHasher,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _totpService = totpService;
        _jwtService = jwtService;
        _tokenHasher = tokenHasher;
        _unitOfWork = unitOfWork;
    }

    public async Task<AuthResult> Handle(Validate2FACommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken)
            ?? throw NotFoundException.ForEntity<User>(request.UserId);

        if (!user.TwoFactorEnabled || string.IsNullOrWhiteSpace(user.TwoFactorSecret))
        {
            throw new ValidationException("TwoFactor", "Two-factor authentication is not enabled.");
        }

        if (!_totpService.ValidateCode(user.TwoFactorSecret, request.Code))
        {
            user.RecordFailedLogin();
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            throw new UnauthorizedException("Invalid verification code.", "INVALID_2FA_CODE");
        }

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
}