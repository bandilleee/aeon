using Aeon.BuildingBlocks.CQRS.Commands;
using Aeon.Common.Kernel.Exceptions;
using Aeon.Identity.Application.DTOs;
using Aeon. Identity.Application.DTOs.Mappings;
using Aeon.Identity.Application.Interfaces;
using Aeon.Identity.Domain.Entities;
using Aeon.Identity.Domain.Enums;
using Aeon. Identity.Domain.Repositories;
using RefreshTokenEntity = Aeon.Identity.Domain.Entities.RefreshToken;

namespace Aeon.Identity.Application.Commands.RefreshToken;

// Handles token refresh with rotation (old token is revoked, new one issued).
public sealed class RefreshTokenCommandHandler: ICommandHandler<RefreshTokenCommand, AuthResult>
{
    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IJwtService _jwtService;
    private readonly ITokenHasher _tokenHasher;
    private readonly IUnitOfWork _unitOfWork;

    // Initializes a new instance of the <see cref="RefreshTokenCommandHandler"/> class. 
    public RefreshTokenCommandHandler(
        IUserRepository userRepository,
        IRefreshTokenRepository refreshTokenRepository,
        IJwtService jwtService,
        ITokenHasher tokenHasher,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _jwtService = jwtService;
        _tokenHasher = tokenHasher;
        _unitOfWork = unitOfWork;
    }

    /// <inheritdoc />
    public async Task<AuthResult> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        // 1. Hash the incoming token and find it
        var tokenHash = _tokenHasher.Hash(request.RefreshToken);
        var storedToken = await _refreshTokenRepository.GetByTokenHashAsync(tokenHash, cancellationToken);

        // 2. Validate token exists and is active
        if (storedToken is null || !storedToken.IsActive)
        {
            throw UnauthorizedException.InvalidToken();
        }

        // 3. Get the user
        var user = await _userRepository.GetByIdAsync(storedToken.UserId, cancellationToken)
            ?? throw UnauthorizedException.InvalidToken();

        // 4. Verify user is still active
        if (user.Status != UserStatus.Active)
        {
            // Revoke the token if user is no longer active
            storedToken.Revoke();
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            throw new UnauthorizedException(
                "Your account is not active. Please contact support.",
                "ACCOUNT_INACTIVE");
        }

        // 5. Generate new tokens (rotation)
        var newAccessToken = _jwtService.GenerateAccessToken(user);
        var newRefreshToken = _jwtService.GenerateRefreshToken();
        var newRefreshTokenHash = _tokenHasher.Hash(newRefreshToken);

        // 6. Revoke old token (with reference to new one)
        storedToken.Revoke(newRefreshTokenHash);

        // 7. Create new refresh token entity
        var newRefreshTokenEntity = RefreshTokenEntity.Create(
            newRefreshTokenHash,
            user.Id,
            DateTime.UtcNow.Add(_jwtService.RefreshTokenExpiry),
            request.IpAddress,
            request.UserAgent);

        await _refreshTokenRepository.AddAsync(newRefreshTokenEntity, cancellationToken);

        // 8. Save changes
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // 9. Return result
        return new AuthResult
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
            AccessTokenExpiry = DateTime.UtcNow.Add(_jwtService.AccessTokenExpiry),
            User = user.ToDto()
        };
    }
}