using Aeon.BuildingBlocks.CQRS.Commands;
using Aeon.Identity.Application.Interfaces;
using Aeon.Identity.Domain.Repositories;
using Microsoft.Extensions.Configuration;

namespace Aeon.Identity.Application.Commands.ForgotPassword;

// Handles forgot password requests by generating secure reset tokens.
public sealed class ForgotPasswordCommandHandler : ICommandHandler<ForgotPasswordCommand>
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenHasher _tokenHasher;
    private readonly IEmailService _emailService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly string _frontendBaseUrl;

    public ForgotPasswordCommandHandler(
        IUserRepository userRepository,
        ITokenHasher tokenHasher,
        IEmailService emailService,
        IUnitOfWork unitOfWork,
        IConfiguration configuration)
    {
        _userRepository = userRepository;
        _tokenHasher = tokenHasher;
        _emailService = emailService;
        _unitOfWork = unitOfWork;
        _frontendBaseUrl = configuration.GetValue<string>("Email:FrontendBaseUrl") ?? "http://localhost:3000";
    }

    public async Task Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);

        // Terminate silently if user is not found to prevent account enumeration attacks
        if (user is null)
        {
            return;
        }

        // Generate and hash a secure, unique reset token
        var resetToken = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
        var hashedToken = _tokenHasher.Hash(resetToken);
        
        user.GeneratePasswordResetToken(hashedToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var resetUrl = $"{_frontendBaseUrl}/reset-password?token={resetToken}&email={Uri.EscapeDataString(user.Email)}";

        await _emailService.SendPasswordResetEmailAsync(
            user.Email,
            resetToken,
            resetUrl,
            cancellationToken);
    }
}