namespace Aeon.Identity.Application.Interfaces;

public interface IEmailService
{
    Task SendPasswordResetEmailAsync(
        string toEmail,
        string resetToken,
        string resetUrl,
        CancellationToken cancellationToken = default);

    Task SendWelcomeEmailAsync(
        string toEmail,
        string firstName,
        string temporaryPassword,
        string loginUrl,
        CancellationToken cancellationToken = default);

    Task SendTwoFactorEnabledEmailAsync(
        string toEmail,
        string firstName,
        CancellationToken cancellationToken = default);

    Task SendTwoFactorDisabledEmailAsync(
        string toEmail,
        string firstName,
        CancellationToken cancellationToken = default);
}