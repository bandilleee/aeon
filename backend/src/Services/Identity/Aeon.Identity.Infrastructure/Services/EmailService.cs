using Aeon.Identity.Application.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;

namespace Aeon.Identity.Infrastructure.Services;

public sealed partial class EmailService : IEmailService
{
    private readonly EmailSettings _settings;
    private readonly ILogger<EmailService> _logger;

    public EmailService(
        IOptions<EmailSettings> settings,
        ILogger<EmailService> logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task SendPasswordResetEmailAsync(
        string toEmail,
        string resetToken,
        string resetUrl,
        CancellationToken cancellationToken = default)
    {
        var subject = "Reset Your Password - Aeon";
        var body = $"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Reset Your Password</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #e4e4e7; padding: 40px 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border-radius: 8px; padding: 40px; border: 1px solid #27272a;">
                    <h1 style="color: #ffffff; margin-bottom: 24px; font-size: 24px;">Reset Your Password</h1>
                    
                    <p style="color: #a1a1aa; line-height: 1.6; margin-bottom: 24px;">
                        We received a request to reset your password. Click the button below to create a new password.
                    </p>
                    
                    <a href="{resetUrl}" style="display: inline-block; background-color: #ffffff; color: #000000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin-bottom: 24px;">
                        Reset Password
                    </a>
                    
                    <p style="color: #71717a; font-size: 14px; line-height: 1.6; margin-top: 24px;">
                        This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #27272a; margin: 32px 0;">
                    
                    <p style="color: #52525b; font-size: 12px;">
                        If the button doesn't work, copy and paste this link into your browser: <br>
                        <a href="{resetUrl}" style="color: #71717a;">{resetUrl}</a>
                    </p>
                </div>
            </body>
            </html>
            """;

        await SendEmailAsync(toEmail, subject, body, cancellationToken);
    }

    public async Task SendWelcomeEmailAsync(
        string toEmail,
        string firstName,
        string temporaryPassword,
        string loginUrl,
        CancellationToken cancellationToken = default)
    {
        var subject = "Welcome to Aeon - Your Account is Ready";
        var body = $"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Welcome to Aeon</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #e4e4e7; padding: 40px 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border-radius: 8px; padding: 40px; border: 1px solid #27272a;">
                    <h1 style="color: #ffffff; margin-bottom: 24px; font-size: 24px;">Welcome to Aeon, {firstName}!</h1>
                    
                    <p style="color: #a1a1aa; line-height: 1.6; margin-bottom: 24px;">
                        Your account has been created. Use the temporary password below to log in for the first time.
                    </p>
                    
                    <div style="background-color: #27272a; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
                        <p style="color: #71717a; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase;">Temporary Password</p>
                        <p style="color: #ffffff; font-family: monospace; font-size: 18px; margin: 0; letter-spacing: 2px;">{temporaryPassword}</p>
                    </div>
                    
                    <p style="color: #fbbf24; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
                        ⚠️ You will be required to change this password after your first login.
                    </p>
                    
                    <a href="{loginUrl}" style="display: inline-block; background-color: #ffffff; color: #000000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                        Log In Now
                    </a>
                    
                    <hr style="border: none; border-top: 1px solid #27272a; margin: 32px 0;">
                    
                    <p style="color: #52525b; font-size: 12px;">
                        If you didn't expect this email, please contact your administrator.
                    </p>
                </div>
            </body>
            </html>
            """;

        await SendEmailAsync(toEmail, subject, body, cancellationToken);
    }

    public async Task SendTwoFactorEnabledEmailAsync(
        string toEmail,
        string firstName,
        CancellationToken cancellationToken = default)
    {
        var subject = "Two-Factor Authentication Enabled - Aeon";
        var body = $"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>2FA Enabled</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #e4e4e7; padding: 40px 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border-radius: 8px; padding: 40px; border: 1px solid #27272a;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <span style="display: inline-block; background-color: #10b981; color: #ffffff; width: 48px; height: 48px; line-height: 48px; border-radius: 50%; font-size: 24px;">✓</span>
                    </div>
                    
                    <h1 style="color: #ffffff; margin-bottom: 24px; font-size: 24px; text-align: center;">2FA Successfully Enabled</h1>
                    
                    <p style="color: #a1a1aa; line-height: 1.6; margin-bottom: 24px;">
                        Hi {firstName}, two-factor authentication has been enabled on your Aeon account. Your account is now more secure.
                    </p>
                    
                    <p style="color: #a1a1aa; line-height: 1.6; margin-bottom: 24px;">
                        Make sure you have saved your backup codes in a safe place. You'll need them if you ever lose access to your authenticator app.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #27272a; margin: 32px 0;">
                    
                    <p style="color: #52525b; font-size: 12px;">
                        If you didn't make this change, please contact support immediately.
                    </p>
                </div>
            </body>
            </html>
            """;

        await SendEmailAsync(toEmail, subject, body, cancellationToken);
    }

    public async Task SendTwoFactorDisabledEmailAsync(
        string toEmail,
        string firstName,
        CancellationToken cancellationToken = default)
    {
        var subject = "Two-Factor Authentication Disabled - Aeon";
        var body = $"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>2FA Disabled</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #e4e4e7; padding: 40px 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border-radius: 8px; padding: 40px; border: 1px solid #27272a;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <span style="display: inline-block; background-color: #f59e0b; color: #ffffff; width: 48px; height: 48px; line-height: 48px; border-radius: 50%; font-size: 24px;">⚠</span>
                    </div>
                    
                    <h1 style="color: #ffffff; margin-bottom: 24px; font-size: 24px; text-align: center;">2FA Has Been Disabled</h1>
                    
                    <p style="color: #a1a1aa; line-height: 1.6; margin-bottom: 24px;">
                        Hi {firstName}, two-factor authentication has been disabled on your Aeon account.
                    </p>
                    
                    <p style="color: #fbbf24; line-height: 1.6; margin-bottom: 24px;">
                        Your account is now less secure. We recommend re-enabling 2FA as soon as possible.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #27272a; margin: 32px 0;">
                    
                    <p style="color: #52525b; font-size: 12px;">
                        If you didn't make this change, please secure your account immediately and contact support.
                    </p>
                </div>
            </body>
            </html>
            """;

        await SendEmailAsync(toEmail, subject, body, cancellationToken);
    }

    private async Task SendEmailAsync(
        string toEmail,
        string subject,
        string htmlBody,
        CancellationToken cancellationToken)
    {
        if (!_settings.Enabled)
        {
            LogEmailSimulated(_logger, toEmail, subject);
            LogEmailBody(_logger, htmlBody);
            return;
        }

        try
        {
            using var client = new SmtpClient(_settings.SmtpHost, _settings.SmtpPort)
            {
                Credentials = new NetworkCredential(_settings.SmtpUsername, _settings.SmtpPassword),
                EnableSsl = _settings.UseSsl
            };

            using var message = new MailMessage
            {
                From = new MailAddress(_settings.FromEmail, _settings.FromName),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true
            };
            message.To.Add(toEmail);

            await client.SendMailAsync(message, cancellationToken);
            
            LogEmailSent(_logger, toEmail, subject);
        }
        catch (Exception ex)
        {
            LogEmailError(_logger, toEmail, subject, ex);
            throw;
        }
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "[DEV] Email would be sent to {ToEmail} with subject: {Subject}")]
    private static partial void LogEmailSimulated(ILogger logger, string toEmail, string subject);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Email body: {Body}")]
    private static partial void LogEmailBody(ILogger logger, string body);

    [LoggerMessage(Level = LogLevel.Information, Message = "Email sent to {ToEmail} with subject: {Subject}")]
    private static partial void LogEmailSent(ILogger logger, string toEmail, string subject);

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to send email to {ToEmail} with subject: {Subject}")]
    private static partial void LogEmailError(ILogger logger, string toEmail, string subject, Exception exception);
}