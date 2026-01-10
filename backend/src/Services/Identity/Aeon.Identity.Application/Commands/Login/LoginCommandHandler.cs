using Aeon.BuildingBlocks.CQRS.Commands;
using Aeon.Common.Kernel.Exceptions;
using Aeon.Identity.Application.DTOs;
using Aeon.Identity.Application.DTOs.Mappings;
using Aeon.Identity.Application.Interfaces;
using Aeon.Identity.Domain.Enums;
using Aeon.Identity.Domain.Repositories;
using RefreshTokenEntity = Aeon.Identity.Domain.Entities.RefreshToken;

namespace Aeon.Identity.Application.Commands.Login;

public sealed class LoginCommandHandler : ICommandHandler<LoginCommand, LoginResult>
{
    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtService _jwtService;
    private readonly ITokenHasher _tokenHasher;
    private readonly IUnitOfWork _unitOfWork;

    public LoginCommandHandler(
        IUserRepository userRepository,
        IRefreshTokenRepository refreshTokenRepository,
        IPasswordHasher passwordHasher,
        IJwtService jwtService,
        ITokenHasher tokenHasher,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
        _tokenHasher = tokenHasher;
        _unitOfWork = unitOfWork;
    }

    public async Task<LoginResult> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);

        if (user is null)
        {
            throw UnauthorizedException.InvalidCredentials();
        }

        if (user.IsLockedOut())
        {
            throw new UnauthorizedException(
                "Account is temporarily locked due to multiple failed login attempts. Please try again later.",
                "ACCOUNT_LOCKED");
        }

        if (user.Status != UserStatus.Active)
        {
            throw new UnauthorizedException(
                "Your account is not active. Please contact support.",
                "ACCOUNT_INACTIVE");
        }

        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            user.RecordFailedLogin();
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            throw UnauthorizedException.InvalidCredentials();
        }

        if (user.TwoFactorEnabled)
        {
            return LoginResult.RequiresTwoFactor(user.Id);
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

        var authResult = new AuthResult
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            AccessTokenExpiry = DateTime.UtcNow.Add(_jwtService.AccessTokenExpiry),
            User = user.ToDto()
        };

        return LoginResult.Success(authResult);
    }
}