using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrgManager.Api.Data;
using OrgManager.Api.Models;
using System.Text.Json;

namespace OrgManager.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/admin/audit-logs")]
    public class AuditLogsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuditLogsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/admin/audit-logs
        [HttpGet]
        public async Task<ActionResult<ApiResponse<object>>> GetLogs(
            [FromQuery] string? category,
            [FromQuery] string? severity,
            [FromQuery] string? result,
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            var query = _context.AuditLogs.AsQueryable();

            if (!string.IsNullOrEmpty(category) && category != "all")
                query = query.Where(l => l.Category == category);

            if (!string.IsNullOrEmpty(severity) && severity != "all")
                query = query.Where(l => l.Severity == severity);

            if (!string.IsNullOrEmpty(result) && result != "all")
                query = query.Where(l => l.Result == result);

            if (!string.IsNullOrEmpty(search))
            {
                var q = search.ToLower();
                query = query.Where(l =>
                    l.Action.ToLower().Contains(q) ||
                    l.Description.ToLower().Contains(q) ||
                    l.ActorName.ToLower().Contains(q) ||
                    l.ActorEmail.ToLower().Contains(q) ||
                    (l.TargetName != null && l.TargetName.ToLower().Contains(q))
                );
            }

            var total = await query.CountAsync();

            var logs = await query
                .OrderByDescending(l => l.Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var mapped = logs.Select(l => new {
                id = l.Id.ToString(),
                timestamp = l.Timestamp,
                actorId = l.ActorId,
                actorName = l.ActorName,
                actorEmail = l.ActorEmail,
                actorRole = l.ActorRole,
                actorInitials = l.ActorInitials,
                action = l.Action,
                actionCode = l.ActionCode,
                category = l.Category,
                severity = l.Severity,
                result = l.Result,
                targetType = l.TargetType,
                targetId = l.TargetId,
                targetName = l.TargetName,
                description = l.Description,
                metadata = string.IsNullOrEmpty(l.MetadataJson)
                    ? null
                    : JsonSerializer.Deserialize<Dictionary<string, object>>(l.MetadataJson),
                changes = string.IsNullOrEmpty(l.ChangesJson)
                    ? null
                    : JsonSerializer.Deserialize<object>(l.ChangesJson),
                ipAddress = l.IpAddress,
                userAgent = l.UserAgent,
                location = l.Location,
                sessionId = l.SessionId
            });

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = new { logs = mapped, total, page, pageSize }
            });
        }
    }
}