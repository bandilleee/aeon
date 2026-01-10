using Aeon.BuildingBlocks.CQRS.Commands;
using Aeon.Identity.Application.Interfaces;
using Aeon. Identity.Domain.Repositories;

namespace Aeon.Identity.Application.Commands.ForgotPassword;

// Handles forgot password requests.
// Always returns success for security (don't reveal if email exists).
public sealed class ForgotPasswordCommandHandler: ICommandHandler<ForgotPasswordCommand>
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtService _jwtService;
    private readonly IUnitOfWork _unitOfWork;
    // TODO: Add IEmailService when implementing email sending

    public ForgotPasswordCommandHandler(
        IUserRepository userRepository,
        IJwtService jwtService,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _jwtService = jwtService;
        _unitOfWork = unitOfWork;
    }

    // <inheritdoc />
    public async Task Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        // 1. Find user by email (silently ignore if not found for security)
        var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);

        if (user is not null)
        {
            // 2. Generate reset token
            var resetToken = _jwtService.GenerateRefreshToken(); // Reuse secure random generation
            user.GeneratePasswordResetToken(resetToken, expiryHours: 1);

            // 3. Save changes
            await _unitOfWork. SaveChangesAsync(cancellationToken);

            // 4. TODO: Send email with reset link
            // await _emailService.SendPasswordResetEmailAsync(user.Email, resetToken);
            
            // For now, log the token (remove in production!)
            Console.WriteLine($"[DEV] Password reset token for {user.Email}: {resetToken}");
        }

        // Always return success (don't reveal if email exists)
    }
}