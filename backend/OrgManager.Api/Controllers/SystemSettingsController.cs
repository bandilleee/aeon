using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrgManager.Api.Data;
using OrgManager.Api.Models;
using OrgManager.Api.Services;
using System.Text.Json;

namespace OrgManager.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/admin/settings")]
    public class SystemSettingsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly AuditService _auditService;

        public SystemSettingsController(AppDbContext context, AuditService auditService)
        {
            _context = context;
            _auditService = auditService;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<object>>> GetSettings()
        {
            var row = await _context.SystemSettings.FindAsync(1);
            if (row == null)
                return Ok(new ApiResponse<object> { Success = true, Data = new { } });

            var parsed = JsonSerializer.Deserialize<object>(row.SettingsJson);
            return Ok(new ApiResponse<object> { Success = true, Data = parsed });
        }

        [HttpPut]
        public async Task<ActionResult<ApiResponse<bool>>> SaveSettings([FromBody] JsonElement body)
        {
            var actorId    = User.FindFirst("id")?.Value ?? "admin";
            var actorEmail = User.FindFirst("email")?.Value ?? "";
            var actorName  = User.FindFirst("displayName")?.Value ?? "Admin";

            var row = await _context.SystemSettings.FindAsync(1);
            if (row == null)
            {
                row = new SystemSetting
                {
                    Id           = 1,
                    SettingsJson = body.GetRawText(),
                    UpdatedAt    = DateTime.UtcNow,
                    UpdatedBy    = actorEmail
                };
                _context.SystemSettings.Add(row);
            }
            else
            {
                row.SettingsJson = body.GetRawText();
                row.UpdatedAt    = DateTime.UtcNow;
                row.UpdatedBy    = actorEmail;
            }

            await _context.SaveChangesAsync();

            await _auditService.LogAsync(
                actionCode:  "SYSTEM_SETTINGS_UPDATE",
                action:      "System Settings Updated",
                category:    "system",
                description: "Admin updated system settings",
                actorId:     actorId,
                actorName:   actorName,
                actorEmail:  actorEmail,
                actorRole:   "admin",
                severity:    "warning",
                result:      "success",
                ipAddress:   HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown"
            );

            return Ok(new ApiResponse<bool> { Success = true, Data = true });
        }
    }
}