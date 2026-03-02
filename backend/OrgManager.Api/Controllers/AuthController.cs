using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OrgManager.Api.Data;
using OrgManager.Api.Models;
using OrgManager.Api.Services;

namespace OrgManager.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext  _context;
        private readonly IConfiguration _configuration;
        private readonly AuditService  _auditService;
        private readonly EmailService  _emailService;

        public AuthController(
            AppDbContext context,
            IConfiguration configuration,
            AuditService auditService,
            EmailService emailService)
        {
            _context      = context;
            _configuration = configuration;
            _auditService = auditService;
            _emailService = emailService;
        }

        // ==================== LOGIN ====================
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
                return Unauthorized(new { message = "Invalid email or password." });

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);

            if (!isPasswordValid)
            {
                user.FailedLoginAttempts++;
                await _context.SaveChangesAsync();

                await _auditService.LogAsync(
                    actionCode:  "AUTH_LOGIN_FAILED",
                    action:      "Login Failed",
                    category:    "authentication",
                    description: $"Failed login attempt for {request.Email}",
                    actorId:     user.Id.ToString(),
                    actorName:   user.DisplayName,
                    actorEmail:  user.Email,
                    actorRole:   user.Role,
                    severity:    "warning",
                    result:      "failure",
                    ipAddress:   HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown"
                );

                return Unauthorized(new { message = "Invalid email or password." });
            }

            if (user.Status != "active")
                return Unauthorized(new { message = $"Your account is {user.Status}. Please contact an administrator." });

            // Update login stats
            user.FailedLoginAttempts = 0;
            user.LoginCount++;
            user.LastLoginAt  = DateTime.UtcNow;
            user.LastActiveAt = DateTime.UtcNow;
            user.UpdatedAt    = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(user);

            await _auditService.LogAsync(
                actionCode:  "AUTH_LOGIN_SUCCESS",
                action:      "Login Successful",
                category:    "authentication",
                description: $"{user.DisplayName} logged in",
                actorId:     user.Id.ToString(),
                actorName:   user.DisplayName,
                actorEmail:  user.Email,
                actorRole:   user.Role,
                severity:    "info",
                result:      "success",
                ipAddress:   HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown"
            );

            return Ok(new
            {
                token,
                user = new
                {
                    id                  = user.Id.ToString(),
                    email               = user.Email,
                    firstName           = user.FirstName,
                    lastName            = user.LastName,
                    displayName         = user.DisplayName,
                    role                = user.Role,
                    status              = user.Status,
                    avatarUrl           = user.AvatarUrl,
                    mustChangePassword  = user.MustChangePassword,
                }
            });
        }

        // ==================== REQUEST ACCESS ====================
        [HttpPost("request-access")]
        public async Task<IActionResult> RequestAccess([FromBody] RequestAccessDto dto)
        {
            // Prevent duplicate requests
            var existing = await _context.AccessRequests
                .FirstOrDefaultAsync(r => r.Email == dto.Email && r.Status == "pending");

            if (existing != null)
                return BadRequest(new { message = "A pending request already exists for this email." });

            var alreadyUser = await _context.Users.AnyAsync(u => u.Email == dto.Email);
            if (alreadyUser)
                return BadRequest(new { message = "An account with this email already exists." });

            var request = new AccessRequest
            {
                Id        = Guid.NewGuid(),
                FirstName = dto.FirstName,
                LastName  = dto.LastName,
                Email     = dto.Email,
                Reason    = dto.Reason,
                Status    = "pending",
                CreatedAt = DateTime.UtcNow,
            };

            _context.AccessRequests.Add(request);
            await _context.SaveChangesAsync();

            // Send confirmation to requester
            _ = _emailService.SendAccessRequestReceivedEmailAsync(dto.Email, dto.FirstName, dto.LastName);

            // Notify all admins
            var admins = await _context.Users
                .Where(u => u.Role == "admin" && u.Status == "active")
                .ToListAsync();

            foreach (var admin in admins)
            {
                _ = _emailService.SendAdminNewAccessRequestNotificationAsync(
                    admin.Email, admin.DisplayName,
                    dto.FirstName, dto.LastName, dto.Email, dto.Reason
                );
            }

            await _auditService.LogAsync(
                actionCode:  "ACCESS_REQUEST_CREATED",
                action:      "Access Request Submitted",
                category:    "user_management",
                description: $"New access request from {dto.FirstName} {dto.LastName} ({dto.Email})",
                actorName:   $"{dto.FirstName} {dto.LastName}",
                actorEmail:  dto.Email,
                severity:    "info",
                result:      "success",
                ipAddress:   HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown"
            );

            return Ok(new { message = "Access request submitted successfully. You'll receive a confirmation email." });
        }

        // ==================== FORGOT PASSWORD ====================
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            // Always return the same response — don't reveal if email exists
            var genericResponse = Ok(new { message = "If that email is registered, a reset link has been sent." });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null) return genericResponse;
            if (user.Status != "active") return genericResponse;

            // Generate a secure random token
            var tokenBytes = RandomNumberGenerator.GetBytes(32);
            var token      = Convert.ToBase64String(tokenBytes)
                .Replace("+", "-").Replace("/", "_").Replace("=", ""); // URL-safe

            user.PasswordResetToken       = BCrypt.Net.BCrypt.HashPassword(token); // store hashed
            user.PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(30);
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
            await _emailService.SendPasswordResetEmailAsync(user.Email, user.DisplayName, token, frontendUrl);

            await _auditService.LogAsync(
                actionCode:  "AUTH_PASSWORD_RESET_REQUESTED",
                action:      "Password Reset Requested",
                category:    "authentication",
                description: $"Password reset requested for {user.Email}",
                actorId:     user.Id.ToString(),
                actorName:   user.DisplayName,
                actorEmail:  user.Email,
                actorRole:   user.Role,
                severity:    "warning",
                result:      "success",
                ipAddress:   HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown"
            );

            return genericResponse;
        }

        // ==================== RESET PASSWORD ====================
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Token) || string.IsNullOrWhiteSpace(dto.Email))
                return BadRequest(new { message = "Invalid reset link." });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (user == null || user.PasswordResetToken == null || user.PasswordResetTokenExpiry == null)
                return BadRequest(new { message = "This reset link is invalid or has already been used." });

            if (user.PasswordResetTokenExpiry < DateTime.UtcNow)
                return BadRequest(new { message = "This reset link has expired. Please request a new one." });

            // Verify the token against the stored hash
            bool tokenValid = BCrypt.Net.BCrypt.Verify(dto.Token, user.PasswordResetToken);
            if (!tokenValid)
                return BadRequest(new { message = "This reset link is invalid or has already been used." });

            if (dto.NewPassword.Length < 8)
                return BadRequest(new { message = "Password must be at least 8 characters." });

            // Set new password and clear the token
            user.PasswordHash             = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.PasswordResetToken       = null;
            user.PasswordResetTokenExpiry = null;
            user.MustChangePassword       = false;
            user.PasswordLastChanged      = DateTime.UtcNow;
            user.UpdatedAt                = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            await _auditService.LogAsync(
                actionCode:  "AUTH_PASSWORD_RESET_SUCCESS",
                action:      "Password Reset Successful",
                category:    "authentication",
                description: $"Password successfully reset for {user.Email}",
                actorId:     user.Id.ToString(),
                actorName:   user.DisplayName,
                actorEmail:  user.Email,
                actorRole:   user.Role,
                severity:    "warning",
                result:      "success",
                ipAddress:   HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown"
            );

            return Ok(new { message = "Password reset successfully. You can now log in with your new password." });
        }

        // ==================== GET CURRENT USER ====================
        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var userId = User.FindFirst("id")?.Value;
            if (userId == null) return Unauthorized();

            var user = await _context.Users.FindAsync(Guid.Parse(userId));
            if (user == null) return NotFound();

            return Ok(new
            {
                id                 = user.Id.ToString(),
                email              = user.Email,
                firstName          = user.FirstName,
                lastName           = user.LastName,
                displayName        = user.DisplayName,
                role               = user.Role,
                status             = user.Status,
                avatarUrl          = user.AvatarUrl,
                mustChangePassword = user.MustChangePassword,
            });
        }

        // ==================== CHANGE PASSWORD (first login) ====================
        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest dto)
        {
            var userId = User.FindFirst("id")?.Value;
            if (userId == null) return Unauthorized();

            var user = await _context.Users.FindAsync(Guid.Parse(userId));
            if (user == null) return NotFound();

            bool currentValid = BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash);
            if (!currentValid)
                return BadRequest(new { message = "Current password is incorrect." });

            if (dto.NewPassword.Length < 8)
                return BadRequest(new { message = "New password must be at least 8 characters." });

            user.PasswordHash        = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.MustChangePassword  = false;
            user.PasswordLastChanged = DateTime.UtcNow;
            user.UpdatedAt           = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            await _auditService.LogAsync(
                actionCode:  "AUTH_PASSWORD_CHANGED",
                action:      "Password Changed",
                category:    "authentication",
                description: $"{user.DisplayName} changed their password",
                actorId:     user.Id.ToString(),
                actorName:   user.DisplayName,
                actorEmail:  user.Email,
                actorRole:   user.Role,
                severity:    "info",
                result:      "success",
                ipAddress:   HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown"
            );

            return Ok(new { message = "Password changed successfully." });
        }

        // ==================== HELPER: Generate JWT Token ====================
        private string GenerateJwtToken(User user)
        {
            var jwtSecret = _configuration["JwtSettings:SecretKey"]!;
            var key       = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
            var creds     = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim("id",          user.Id.ToString()),
                new Claim("email",       user.Email),
                new Claim("displayName", user.DisplayName),
                new Claim("role",        user.Role),
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            var token = new JwtSecurityToken(
                issuer:             _configuration["JwtSettings:Issuer"],
                audience:           _configuration["JwtSettings:Audience"],
                claims:             claims,
                expires:            DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    // ==================== DTOs ====================
    public class LoginRequest
    {
        public string Email    { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RequestAccessDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName  { get; set; } = string.Empty;
        public string Email     { get; set; } = string.Empty;
        public string Reason    { get; set; } = string.Empty;
    }

    public class ForgotPasswordDto
    {
        public string Email { get; set; } = string.Empty;
    }

    public class ResetPasswordDto
    {
        public string Token       { get; set; } = string.Empty;
        public string Email       { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword     { get; set; } = string.Empty;
    }
}