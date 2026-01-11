using Aeon.BuildingBlocks.Web.Controllers;
using Aeon.BuildingBlocks.Web.Responses;
using Aeon.Common.Kernel.Exceptions;
using Aeon.Identity.Api.Configuration;
using Aeon.Identity.Api.Models.Requests;
using Aeon.Identity.Application.Commands.ForgotPassword;
using Aeon.Identity.Application.Commands.Login;
using Aeon.Identity.Application.Commands.RefreshToken;
using Aeon.Identity.Application.Commands.ResetPassword;
using Aeon.Identity.Application.Commands.SetPassword;
using Aeon.Identity.Application.Commands.TwoFactor.Disable;
using Aeon.Identity.Application.Commands.TwoFactor.Setup;
using Aeon.Identity.Application.Commands.TwoFactor.Skip;
using Aeon.Identity.Application.Commands.TwoFactor.UseBackupCode;
using Aeon.Identity.Application.Commands.TwoFactor.Validate;
using Aeon.Identity.Application.Commands.TwoFactor.Verify;
using Aeon.Identity.Application.DTOs;
using Aeon.Identity.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;

namespace Aeon.Identity.Api.Controllers;

[Route("api/auth")]
public sealed class AuthController : BaseApiController
{
    private readonly IRecaptchaService _recaptchaService;

    public AuthController(IRecaptchaService recaptchaService)
    {
        _recaptchaService = recaptchaService;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting(RateLimitingConfiguration.LoginPolicy)]
    [ProducesResponseType(typeof(ApiResponse<LoginResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        await ValidateRecaptchaAsync(request.RecaptchaToken, "login");

        var command = new LoginCommand
        {
            Email = request.Email,
            Password = request.Password,
            RememberMe = request.RememberMe,
            IpAddress = GetIpAddress(),
            UserAgent = GetUserAgent()
        };

        var result = await Mediator.Send(command);

        return OkResponse(result);
    }

    [HttpPost("2fa/validate")]
    [AllowAnonymous]
    [EnableRateLimiting(RateLimitingConfiguration.TwoFactorPolicy)]
    [ProducesResponseType(typeof(ApiResponse<AuthResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> Validate2FA([FromBody] Validate2FARequest request)
    {
        var command = new Validate2FACommand
        {
            UserId = request.UserId,
            Code = request.Code,
            RememberMe = request.RememberMe,
            IpAddress = GetIpAddress(),
            UserAgent = GetUserAgent()
        };

        var result = await Mediator.Send(command);

        return OkResponse(result);
    }

    [HttpPost("2fa/backup-code")]
    [AllowAnonymous]
    [EnableRateLimiting(RateLimitingConfiguration.TwoFactorPolicy)]
    [ProducesResponseType(typeof(ApiResponse<AuthResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> UseBackupCode([FromBody] UseBackupCodeRequest request)
    {
        var command = new UseBackupCodeCommand
        {
            UserId = request.UserId,
            BackupCode = request.BackupCode,
            RememberMe = request.RememberMe,
            IpAddress = GetIpAddress(),
            UserAgent = GetUserAgent()
        };

        var result = await Mediator.Send(command);

        return OkResponse(result);
    }

    [HttpPost("set-password")]
    [Authorize]
    [EnableRateLimiting(RateLimitingConfiguration.GeneralPolicy)]
    [ProducesResponseType(typeof(ApiResponse<AuthResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SetPassword([FromBody] SetPasswordRequest request)
    {
        var command = new SetPasswordCommand
        {
            UserId = GetUserId(),
            NewPassword = request.NewPassword,
            ConfirmPassword = request.ConfirmPassword,
            IpAddress = GetIpAddress(),
            UserAgent = GetUserAgent()
        };

        var result = await Mediator.Send(command);

        return OkResponse(result);
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    [EnableRateLimiting(RateLimitingConfiguration.PasswordResetPolicy)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        await ValidateRecaptchaAsync(request.RecaptchaToken, "forgot_password");

        var command = new ForgotPasswordCommand
        {
            Email = request.Email
        };

        await Mediator.Send(command);

        return OkResponse();
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    [EnableRateLimiting(RateLimitingConfiguration.PasswordResetPolicy)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        await ValidateRecaptchaAsync(request.RecaptchaToken, "reset_password");

        var command = new ResetPasswordCommand
        {
            Token = request.Token,
            Email = request.Email,
            NewPassword = request.NewPassword,
            ConfirmPassword = request.ConfirmPassword
        };

        await Mediator.Send(command);

        return OkResponse();
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    [EnableRateLimiting(RateLimitingConfiguration.GeneralPolicy)]
    [ProducesResponseType(typeof(ApiResponse<AuthResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var command = new RefreshTokenCommand
        {
            RefreshToken = request.RefreshToken,
            IpAddress = GetIpAddress(),
            UserAgent = GetUserAgent()
        };

        var result = await Mediator.Send(command);

        return OkResponse(result);
    }

    [HttpPost("2fa/setup")]
    [Authorize]
    [EnableRateLimiting(RateLimitingConfiguration.GeneralPolicy)]
    [ProducesResponseType(typeof(ApiResponse<TwoFactorSetupResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Setup2FA()
    {
        var command = new Setup2FACommand
        {
            UserId = GetUserId()
        };

        var result = await Mediator.Send(command);

        return OkResponse(result);
    }

    [HttpPost("2fa/verify")]
    [Authorize]
    [EnableRateLimiting(RateLimitingConfiguration.TwoFactorPolicy)]
    [ProducesResponseType(typeof(ApiResponse<BackupCodesResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Verify2FA([FromBody] Verify2FARequest request)
    {
        var command = new Verify2FACommand
        {
            UserId = GetUserId(),
            Code = request.Code
        };

        var result = await Mediator.Send(command);

        return OkResponse(result);
    }

    [HttpPost("2fa/skip")]
    [Authorize]
    [EnableRateLimiting(RateLimitingConfiguration.GeneralPolicy)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Skip2FA()
    {
        var command = new Skip2FACommand
        {
            UserId = GetUserId()
        };

        await Mediator.Send(command);

        return OkResponse();
    }

    [HttpPost("2fa/disable")]
    [Authorize]
    [EnableRateLimiting(RateLimitingConfiguration.GeneralPolicy)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Disable2FA([FromBody] Disable2FARequest request)
    {
        var command = new Disable2FACommand
        {
            UserId = GetUserId(),
            Password = request.Password
        };

        await Mediator.Send(command);

        return OkResponse();
    }

    private async Task ValidateRecaptchaAsync(string? token, string action)
    {
        var isValid = await _recaptchaService.ValidateAsync(token ?? string.Empty, action);

        if (!isValid)
        {
            throw new ValidationException("recaptchaToken", "reCAPTCHA verification failed.  Please try again.");
        }
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub");

        if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            throw new UnauthorizedAccessException("Invalid user token.");
        }

        return userId;
    }

    private string? GetIpAddress()
    {
        if (Request.Headers.TryGetValue("X-Forwarded-For", out var forwardedFor))
        {
            var ip = forwardedFor.FirstOrDefault()?.Split(',').FirstOrDefault()?.Trim();
            if (!string.IsNullOrEmpty(ip))
            {
                return ip;
            }
        }

        return HttpContext.Connection.RemoteIpAddress?.ToString();
    }

    private string? GetUserAgent()
    {
        return Request.Headers.UserAgent.FirstOrDefault();
    }
}