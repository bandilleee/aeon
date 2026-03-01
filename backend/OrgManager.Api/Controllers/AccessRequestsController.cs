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

        public AccessRequestsController(AppDbContext context, AuditService auditService)
        {
            _context = context;
            _auditService = auditService;
        }

        // GET: api/admin/access-requests
        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<object>>>> GetAll([FromQuery] string? status)
        {
            var query = _context.AccessRequests.AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(r => r.Status == status);

            var requests = await query
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new {
                    id = r.Id.ToString(),
                    firstName = r.FirstName,
                    lastName = r.LastName,
                    email = r.Email,
                    reason = r.Reason,
                    status = r.Status,
                    reviewedBy = r.ReviewedBy,
                    reviewNote = r.ReviewNote,
                    reviewedAt = r.ReviewedAt,
                    createdAt = r.CreatedAt
                })
                .ToListAsync();

            return Ok(new ApiResponse<object> { Success = true, Data = requests });
        }

        // PUT: api/admin/access-requests/{id}/approve
        [HttpPut("{id}/approve")]
        public async Task<ActionResult<ApiResponse<object>>> Approve(Guid id, [FromBody] ApproveRequestDto dto)
        {
            var request = await _context.AccessRequests.FindAsync(id);
            if (request == null)
                return NotFound(new ApiResponse<object> { Success = false, Error = new { message = "Request not found" } });

            if (request.Status != "pending")
                return BadRequest(new ApiResponse<object> { Success = false, Error = new { message = "Request has already been reviewed" } });

            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest(new ApiResponse<object> { Success = false, Error = new { message = "A user with this email already exists" } });

            var newUser = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                DisplayName = $"{request.FirstName} {request.LastName}",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.TemporaryPassword ?? "Welcome@123"),
                Role = dto.Role ?? "member",
                Status = "active",
                MustChangePassword = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(newUser);

            request.Status = "approved";
            request.ReviewedBy = dto.ReviewedBy;
            request.ReviewNote = dto.Note;
            request.ReviewedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await _auditService.LogAsync(
                actionCode: "ACCESS_REQUEST_APPROVED",
                action: "Access Request Approved",
                category: "user_management",
                description: $"Access request approved for {request.Email}. Account created with role '{dto.Role ?? "member"}'.",
                actorId: dto.ReviewedBy ?? "admin",
                actorName: dto.ReviewedBy ?? "Admin",
                actorEmail: "",
                actorRole: "admin",
                severity: "info",
                result: "success",
                targetType: "user",
                targetId: newUser.Id.ToString(),
                targetName: $"{request.FirstName} {request.LastName}",
                ipAddress: HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown"
            );

            return Ok(new ApiResponse<object> {
                Success = true,
                Data = new { message = $"Request approved. Account created for {request.Email}." }
            });
        }

        // PUT: api/admin/access-requests/{id}/reject
        [HttpPut("{id}/reject")]
        public async Task<ActionResult<ApiResponse<object>>> Reject(Guid id, [FromBody] RejectRequestDto dto)
        {
            var request = await _context.AccessRequests.FindAsync(id);
            if (request == null)
                return NotFound(new ApiResponse<object> { Success = false, Error = new { message = "Request not found" } });

            if (request.Status != "pending")
                return BadRequest(new ApiResponse<object> { Success = false, Error = new { message = "Request has already been reviewed" } });

            request.Status = "rejected";
            request.ReviewedBy = dto.ReviewedBy;
            request.ReviewNote = dto.Reason;
            request.ReviewedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await _auditService.LogAsync(
                actionCode: "ACCESS_REQUEST_REJECTED",
                action: "Access Request Rejected",
                category: "user_management",
                description: $"Access request rejected for {request.Email}. Reason: {dto.Reason}",
                actorId: dto.ReviewedBy ?? "admin",
                actorName: dto.ReviewedBy ?? "Admin",
                actorEmail: "",
                actorRole: "admin",
                severity: "warning",
                result: "success",
                targetType: "user",
                targetId: request.Email,
                targetName: $"{request.FirstName} {request.LastName}",
                ipAddress: HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown"
            );

            return Ok(new ApiResponse<object> {
                Success = true,
                Data = new { message = "Request rejected." }
            });
        }
    }

    public class ApproveRequestDto
    {
        public string? Role { get; set; } = "member";
        public string? TemporaryPassword { get; set; }
        public string? Note { get; set; }
        public string? ReviewedBy { get; set; }
    }

    public class RejectRequestDto
    {
        public string Reason { get; set; } = string.Empty;
        public string? ReviewedBy { get; set; }
    }
}