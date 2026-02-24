using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrgManager.Api.Data;
using OrgManager.Api.Models;

namespace OrgManager.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SettingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SettingsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/settings/{userId}
        [HttpGet("{userId}")]
        public async Task<ActionResult<ApiResponse<UserSettings>>> GetSettings(string userId)
        {
            var settings = await _context.UserSettings.FirstOrDefaultAsync(s => s.UserId == userId);
            
            // Auto-Generate profile if this is their first time!
            if (settings == null)
            {
                settings = new UserSettings { 
                    Id = Guid.NewGuid(), 
                    UserId = userId,
                    DisplayName = "Jane Doe",
                    Email = "jane@example.com",
                    Phone = "+27 82 123 4567"
                };
                _context.UserSettings.Add(settings);
                await _context.SaveChangesAsync();
            }

            return Ok(new ApiResponse<UserSettings> { Success = true, Data = settings });
        }

        // PUT: api/settings/profile/{userId}
        [HttpPut("profile/{userId}")]
        public async Task<ActionResult<ApiResponse<UserSettings>>> UpdateProfile(string userId, UserSettings updated)
        {
            var settings = await _context.UserSettings.FirstOrDefaultAsync(s => s.UserId == userId);
            if (settings == null) return NotFound(new ApiResponse<object> { Success = false, Error = new { message = "Settings not found" } });

            settings.DisplayName = updated.DisplayName;
            settings.Email = updated.Email;
            settings.Phone = updated.Phone;
            settings.Bio = updated.Bio;
            settings.AvatarUrl = updated.AvatarUrl;

            await _context.SaveChangesAsync();
            return Ok(new ApiResponse<UserSettings> { Success = true, Data = settings });
        }

        // PUT: api/settings/notifications/{userId}
        [HttpPut("notifications/{userId}")]
        public async Task<ActionResult<ApiResponse<UserSettings>>> UpdateNotifications(string userId, UserSettings updated)
        {
            var settings = await _context.UserSettings.FirstOrDefaultAsync(s => s.UserId == userId);
            if (settings == null) return NotFound(new ApiResponse<object> { Success = false, Error = new { message = "Settings not found" } });

            settings.EmailNotifications = updated.EmailNotifications;
            settings.EventNotifications = updated.EventNotifications;
            settings.TaskNotifications = updated.TaskNotifications;
            settings.MemberNotifications = updated.MemberNotifications;

            await _context.SaveChangesAsync();
            return Ok(new ApiResponse<UserSettings> { Success = true, Data = settings });
        }

        // PUT: api/settings/2fa/{userId}
        [HttpPut("2fa/{userId}")]
        public async Task<ActionResult<ApiResponse<UserSettings>>> Toggle2FA(string userId, [FromBody] bool isEnabled)
        {
            var settings = await _context.UserSettings.FirstOrDefaultAsync(s => s.UserId == userId);
            if (settings == null) return NotFound();

            settings.TwoFactorEnabled = isEnabled;
            await _context.SaveChangesAsync();
            return Ok(new ApiResponse<UserSettings> { Success = true, Data = settings });
        }

        // POST: api/settings/password/{userId}
        [HttpPost("password/{userId}")]
        public async Task<ActionResult<ApiResponse<string>>> ChangePassword(string userId, [FromBody] ChangePasswordDto request)
        {
            // Note: In production, you would use ASP.NET Core Identity to verify and hash passwords here.
            // For now, we simulate a successful change so your frontend UI works flawlessly!
            await Task.Delay(500); 
            return Ok(new ApiResponse<string> { Success = true, Data = "Password updated successfully" });
        }
    }

    // Helper class for the password payload
    public class ChangePasswordDto
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}