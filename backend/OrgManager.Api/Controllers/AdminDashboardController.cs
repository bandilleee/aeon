using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrgManager.Api.Data;
using OrgManager.Api.Models;

namespace OrgManager.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/admin/dashboard")]
    public class AdminDashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminDashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<ActionResult<ApiResponse<object>>> GetDashboardStats()
        {
            // User stats
            var totalUsers = await _context.Users.CountAsync();
            var activeUsers = await _context.Users.CountAsync(u => u.Status == "active");
            var pendingUsers = await _context.Users.CountAsync(u => u.Status == "pending");
            var adminCount = await _context.Users.CountAsync(u => u.Role == "admin");

            // Event stats
            var totalEvents = await _context.Events.CountAsync();
            var pendingEvents = await _context.Events.CountAsync(e => e.Status == "pending_approval");
            var approvedEvents = await _context.Events.CountAsync(e => e.Status == "approved");
            var upcomingEvents = await _context.Events.CountAsync(e =>
                e.Status == "approved" && e.StartDate > DateTime.UtcNow);

            // Task stats
            var totalTasks = await _context.Tasks.CountAsync();
            var todoTasks = await _context.Tasks.CountAsync(t => t.Status == "todo");
            var inProgressTasks = await _context.Tasks.CountAsync(t => t.Status == "in_progress");
            var completedTasks = await _context.Tasks.CountAsync(t => t.Status == "completed");

            // Member stats
            var totalMembers = await _context.Members.CountAsync();
            var activeMembers = await _context.Members.CountAsync(m => m.Status == "active");

            // Access request stats  ← NEW
            var pendingAccessRequests = await _context.AccessRequests
                .CountAsync(r => r.Status == "pending");

            // Recent users (last 5)
            var recentUsers = await _context.Users
                .OrderByDescending(u => u.CreatedAt)
                .Take(5)
                .Select(u => new {
                    id = u.Id.ToString(),
                    displayName = string.IsNullOrEmpty(u.DisplayName) ? u.Email : u.DisplayName,
                    email = u.Email,
                    role = u.Role,
                    status = u.Status,
                    createdAt = u.CreatedAt
                })
                .ToListAsync();

            // Recent events (last 5)
            var recentEvents = await _context.Events
                .OrderByDescending(e => e.CreatedAt)
                .Take(5)
                .Select(e => new {
                    id = e.Id.ToString(),
                    title = e.Title,
                    status = e.Status,
                    category = e.Category,
                    startDate = e.StartDate,
                    createdAt = e.CreatedAt
                })
                .ToListAsync();

            // Pending event approvals (last 5)
            var pendingApprovals = await _context.Events
                .Where(e => e.Status == "pending_approval")
                .OrderByDescending(e => e.CreatedAt)
                .Take(5)
                .Select(e => new {
                    id = e.Id.ToString(),
                    title = e.Title,
                    category = e.Category,
                    createdAt = e.CreatedAt
                })
                .ToListAsync();

            var stats = new {
                users = new {
                    total = totalUsers,
                    active = activeUsers,
                    pending = pendingUsers,
                    admins = adminCount
                },
                events = new {
                    total = totalEvents,
                    pending = pendingEvents,
                    approved = approvedEvents,
                    upcoming = upcomingEvents
                },
                tasks = new {
                    total = totalTasks,
                    todo = todoTasks,
                    inProgress = inProgressTasks,
                    completed = completedTasks
                },
                members = new {
                    total = totalMembers,
                    active = activeMembers
                },
                accessRequests = new {         // ← NEW
                    pending = pendingAccessRequests
                },
                recent = new {
                    users = recentUsers,
                    events = recentEvents
                },
                pendingApprovals = pendingApprovals
            };

            return Ok(new ApiResponse<object> { Success = true, Data = stats });
        }
    }
}