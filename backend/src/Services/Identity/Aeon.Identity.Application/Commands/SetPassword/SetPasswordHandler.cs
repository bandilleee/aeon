using Aeon.BuildingBlocks.CQRS.Commands;
using Aeon.Common.Kernel.Exceptions;
using Aeon.Identity.Application.DTOs;
using Aeon.Identity.Application.DTOs.Mappings;
using Aeon.Identity.Application.Interfaces;
using Aeon.Identity.Domain.Entities;
using Aeon.Identity.Domain.Repositories;
using Aeon.Identity.Domain.ValueObjects;
using RefreshTokenEntity = Aeon.Identity.Domain.Entities.RefreshToken;

namespace Aeon.Identity.Application.Commands.SetPassword;

public sealed class SetPasswordCommandHandler : ICommandHandler<SetPasswordCommand, AuthResult>
{
    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtService _jwtService;
    private readonly ITokenHasher _tokenHasher;
    private readonly IUnitOfWork _unitOfWork;

    public SetPasswordCommandHandler(
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

    public async Task<AuthResult> Handle(SetPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken)
            ?? throw NotFoundException.ForEntity<User>(request.UserId);

        if (!user.RequiresPasswordChange)
        {
            throw new ValidationException("Password", "Password change is not required.");
        }

        Password.Validate(request.NewPassword);

        var passwordHash = _passwordHasher.Hash(request.NewPassword);
        user.ChangePassword(passwordHash);

        await _refreshTokenRepository.RevokeAllByUserIdAsync(user.Id, cancellationToken);

        var accessToken = _jwtService.GenerateAccessToken(user);
        var refreshToken = _jwtService.GenerateRefreshToken();
        var refreshTokenHash = _tokenHasher.Hash(refreshToken);

        var refreshTokenEntity = RefreshTokenEntity.Create(
            refreshTokenHash,
            user.Id,
            DateTime.UtcNow.Add(_jwtService.RefreshTokenExpiry),
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