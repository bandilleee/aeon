using Aeon.BuildingBlocks.CQRS.Commands;
using Aeon.Common.Kernel.Exceptions;
using Aeon.Identity.Application.Interfaces;
using Aeon.Identity.Domain.Repositories;
using Aeon.Identity.Domain.ValueObjects;

namespace Aeon.Identity.Application.Commands.ResetPassword;

/// Handles password reset using a valid reset token.
public sealed class ResetPasswordCommandHandler: ICommandHandler<ResetPasswordCommand>
{
    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IUnitOfWork _unitOfWork;

    public ResetPasswordCommandHandler(
        IUserRepository userRepository,
        IRefreshTokenRepository refreshTokenRepository,
        IPasswordHasher passwordHasher,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _passwordHasher = passwordHasher;
        _unitOfWork = unitOfWork;
    }

    /// <inheritdoc />
    public async Task Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        // 1. Find user by email
        var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);

        // 2. Validate token (generic error message for security)
        if (user is null || !user.ValidatePasswordResetToken(request.Token))
        {
            throw new UnauthorizedException(
                "Invalid or expired reset token. Please request a new password reset.",
                "INVALID_RESET_TOKEN");
        }

        // 3. Validate password strength
        Password.Validate(request.NewPassword);

        // 4. Hash and set new password
        var passwordHash = _passwordHasher.Hash(request.NewPassword);
        user.ChangePassword(passwordHash);

        // 5. Revoke all refresh tokens (log out all sessions)
        await _refreshTokenRepository.RevokeAllByUserIdAsync(user.Id, cancellationToken);

        // 6. Save changes
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}