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
    [Route("api/admin/access-requests")]
    public class AccessRequestsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly AuditService _auditService;
        private readonly EmailService _emailService;

        public AccessRequestsController(AppDbContext context, AuditService auditService, EmailService emailService)
        {
            _context      = context;
            _auditService = auditService;
            _emailService = emailService;
        }

        // GET: api/admin/access-requests
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? status)
        {
            var query = _context.AccessRequests.AsQueryable();

            if (!string.IsNullOrEmpty(status) && status != "all")
                query = query.Where(r => r.Status == status);

            var requests = await query
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return Ok(new { success = true, data = requests });
        }

        // PUT: api/admin/access-requests/{id}/approve
        [HttpPut("{id}/approve")]
        public async Task<IActionResult> Approve(Guid id, [FromBody] ApproveRequestDto dto)
        {
            var actorId    = User.FindFirst("id")?.Value    ?? "admin";
            var actorEmail = User.FindFirst("email")?.Value ?? "";
            var actorName  = User.FindFirst("displayName")?.Value ?? "Admin";

            var request = await _context.AccessRequests.FindAsync(id);
            if (request == null)
                return NotFound(new { message = "Request not found." });

            if (request.Status != "pending")
                return BadRequest(new { message = "This request has already been reviewed." });

            // Determine temp password
            var tempPassword = string.IsNullOrWhiteSpace(dto.TemporaryPassword)
                ? GenerateTemporaryPassword()
                : dto.TemporaryPassword;

            // Create the user account
            var newUser = new User
            {
                Id                  = Guid.NewGuid(),
                Email               = request.Email,
                FirstName           = request.FirstName,
                LastName            = request.LastName,
                DisplayName         = $"{request.FirstName} {request.LastName}",
                PasswordHash        = BCrypt.Net.BCrypt.HashPassword(tempPassword),
                Role                = dto.Role ?? "member",
                Status              = "active",
                MustChangePassword  = true,
                PasswordLastChanged = DateTime.UtcNow,
                CreatedAt           = DateTime.UtcNow,
                UpdatedAt           = DateTime.UtcNow,
            };

            _context.Users.Add(newUser);

            // Update the request
            request.Status     = "approved";
            request.ReviewedBy = actorName;
            request.ReviewNote = dto.Note;
            request.ReviewedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Send welcome email with credentials
            _ = _emailService.SendWelcomeEmailAsync(request.Email, newUser.DisplayName, tempPassword);

            await _auditService.LogAsync(
                actionCode:  "ACCESS_REQUEST_APPROVED",
                action:      "Access Request Approved",
                category:    "user_management",
                description: $"Access request from {request.FirstName} {request.LastName} approved. User account created.",
                actorId:     actorId,
                actorName:   actorName,
                actorEmail:  actorEmail,
                actorRole:   "admin",
                targetType:  "user",
                targetId:    newUser.Id.ToString(),
                targetName:  newUser.DisplayName,
                severity:    "info",
                result:      "success",
                ipAddress:   HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown"
            );

            return Ok(new { success = true, data = true });
        }

        // PUT: api/admin/access-requests/{id}/reject
        [HttpPut("{id}/reject")]
        public async Task<IActionResult> Reject(Guid id, [FromBody] RejectRequestDto dto)
        {
            var actorId    = User.FindFirst("id")?.Value    ?? "admin";
            var actorEmail = User.FindFirst("email")?.Value ?? "";
            var actorName  = User.FindFirst("displayName")?.Value ?? "Admin";

            var request = await _context.AccessRequests.FindAsync(id);
            if (request == null)
                return NotFound(new { message = "Request not found." });

            if (request.Status != "pending")
                return BadRequest(new { message = "This request has already been reviewed." });

            request.Status     = "rejected";
            request.ReviewedBy = actorName;
            request.ReviewNote = dto.Reason;
            request.ReviewedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Send rejection notification
            _ = _emailService.SendAccessRejectedEmailAsync(request.Email, request.FirstName, request.LastName, dto.Reason);

            await _auditService.LogAsync(
                actionCode:  "ACCESS_REQUEST_REJECTED",
                action:      "Access Request Rejected",
                category:    "user_management",
                description: $"Access request from {request.FirstName} {request.LastName} rejected.",
                actorId:     actorId,
                actorName:   actorName,
                actorEmail:  actorEmail,
                actorRole:   "admin",
                severity:    "warning",
                result:      "success",
                ipAddress:   HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown"
            );

            return Ok(new { success = true, data = true });
        }

        private static string GenerateTemporaryPassword()
        {
            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$";
            var rng    = System.Security.Cryptography.RandomNumberGenerator.Create();
            var bytes  = new byte[12];
            rng.GetBytes(bytes);
            return new string(bytes.Select(b => chars[b % chars.Length]).ToArray());
        }
    }

    public class ApproveRequestDto
    {
        public string? Role              { get; set; } = "member";
        public string? TemporaryPassword { get; set; }
        public string? Note              { get; set; }
        public string? ReviewedBy        { get; set; }
    }

    public class RejectRequestDto
    {
        public string  Reason     { get; set; } = string.Empty;
        public string? ReviewedBy { get; set; }
    }
}