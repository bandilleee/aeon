using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrgManager.Api.Data;
using OrgManager.Api.Models;
using OrgManager.Api.Services;

namespace OrgManager.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SettingsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;

        public SettingsController(AppDbContext context, EmailService emailService)
        {
            _context      = context;
            _emailService = emailService;
        }

        // ── GET: api/settings/{userId} ──────────────────────────────────────
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetSettings(string userId)
        {
            var settings = await _context.UserSettings
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (settings == null)
            {
                // Return defaults — no row yet means all notifications are default ON
                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        id                  = (string?)null,
                        userId,
                        displayName         = "",
                        email               = "",
                        phone               = "",
                        bio                 = "",
                        avatarUrl           = "",
                        emailNotifications  = true,
                        eventNotifications  = true,
                        taskNotifications   = false,
                        memberNotifications = true,
                        twoFactorEnabled    = false
                    }
                });
            }

            return Ok(new { success = true, data = settings });
        }

        // ── PUT: api/settings/profile/{userId} ──────────────────────────────
        [HttpPut("profile/{userId}")]
        public async Task<IActionResult> UpdateProfile(
            string userId, [FromBody] UpdateProfileDto dto)
        {
            var settings = await _context.UserSettings
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (settings == null)
            {
                settings = new UserSettings { Id = Guid.NewGuid(), UserId = userId };
                _context.UserSettings.Add(settings);
            }

            if (dto.DisplayName != null) settings.DisplayName = dto.DisplayName;
            if (dto.Email       != null) settings.Email       = dto.Email;
            if (dto.Phone       != null) settings.Phone       = dto.Phone;
            if (dto.Bio         != null) settings.Bio         = dto.Bio;
            if (dto.AvatarUrl   != null) settings.AvatarUrl   = dto.AvatarUrl;

            // Sync changes back to the main Users table
            User? userRow = null;
            if (Guid.TryParse(userId, out var userGuid))
            {
                userRow = await _context.Users.FindAsync(userGuid);
                if (userRow != null)
                {
                    if (dto.DisplayName != null) userRow.DisplayName = dto.DisplayName;
                    if (dto.Phone       != null) userRow.Phone       = dto.Phone;
                    userRow.UpdatedAt = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();

            // ── Send profile-updated email if pref allows ────────────────────
            if (userRow != null)
            {
                var prefs = settings; // already loaded above
                bool emailOn = prefs.EmailNotifications;  // EmailNotifications governs account emails too

                if (emailOn)
                {
                    _ = _emailService.SendProfileUpdatedAsync(
                        userRow.Email,
                        userRow.DisplayName);
                }
            }

            return Ok(new { success = true, data = settings });
        }

        // ── PUT: api/settings/notifications/{userId} ────────────────────────
        [HttpPut("notifications/{userId}")]
        public async Task<IActionResult> UpdateNotifications(
            string userId, [FromBody] UpdateNotificationsDto dto)
        {
            var settings = await _context.UserSettings
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (settings == null)
            {
                settings = new UserSettings { Id = Guid.NewGuid(), UserId = userId };
                _context.UserSettings.Add(settings);
            }

            settings.EmailNotifications  = dto.EmailNotifications;
            settings.EventNotifications  = dto.EventNotifications;
            settings.TaskNotifications   = dto.TaskNotifications;
            settings.MemberNotifications = dto.MemberNotifications;

            await _context.SaveChangesAsync();
            return Ok(new { success = true, data = settings });
        }

        // ── PUT: api/settings/2fa/{userId} ──────────────────────────────────
        [HttpPut("2fa/{userId}")]
        public async Task<IActionResult> Toggle2FA(
            string userId, [FromBody] Toggle2faDto dto)
        {
            var settings = await _context.UserSettings
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (settings == null)
            {
                settings = new UserSettings { Id = Guid.NewGuid(), UserId = userId };
                _context.UserSettings.Add(settings);
            }

            settings.TwoFactorEnabled = dto.Enabled;

            // Sync to Users table
            if (Guid.TryParse(userId, out var userGuid))
            {
                var user = await _context.Users.FindAsync(userGuid);
                if (user != null)
                {
                    user.TwoFactorStatus = dto.Enabled ? "enabled" : "disabled";
                    user.UpdatedAt       = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true, data = settings });
        }

        // ── POST: api/settings/password/{userId} ────────────────────────────
        [HttpPost("password/{userId}")]
        public async Task<IActionResult> ChangePassword(
            string userId, [FromBody] ChangePasswordDto dto)
        {
            if (!Guid.TryParse(userId, out var userGuid))
                return BadRequest(new { message = "Invalid user ID." });

            var user = await _context.Users.FindAsync(userGuid);
            if (user == null)
                return NotFound(new { message = "User not found." });

            // Verify current password
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

            // ── Password-changed email always fires — it's a security email ──
            _ = _emailService.SendPasswordChangedAsync(user.Email, user.DisplayName);

            return Ok(new { success = true, data = "Password changed successfully." });
        }
    }

    // ── DTOs ──────────────────────────────────────────────────────────────────
    public class UpdateProfileDto
    {
        public string? DisplayName { get; set; }
        public string? Email       { get; set; }
        public string? Phone       { get; set; }
        public string? Bio         { get; set; }
        public string? AvatarUrl   { get; set; }
    }

    public class UpdateNotificationsDto
    {
        public bool EmailNotifications  { get; set; } = true;
        public bool EventNotifications  { get; set; } = true;
        public bool TaskNotifications   { get; set; } = false;
        public bool MemberNotifications { get; set; } = true;
    }

    public class Toggle2faDto
    {
        public bool Enabled { get; set; }
    }

    public class ChangePasswordDto
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword     { get; set; } = string.Empty;
    }
}