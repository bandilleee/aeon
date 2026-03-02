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
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;

        public TasksController(AppDbContext context, EmailService emailService)
        {
            _context      = context;
            _emailService = emailService;
        }

        // ── GET: api/tasks ──────────────────────────────────────────────────
        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<TaskItem>>>> GetTasks()
        {
            var tasks = await _context.Tasks.ToListAsync();
            return Ok(new ApiResponse<IEnumerable<TaskItem>> { Success = true, Data = tasks });
        }

        // ── GET: api/tasks/{id} ─────────────────────────────────────────────
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<TaskItem>>> GetTask(Guid id)
        {
            var task = await _context.Tasks.FindAsync(id);

            if (task == null)
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Error   = new { message = "Task not found" }
                });

            return Ok(new ApiResponse<TaskItem> { Success = true, Data = task });
        }

        // ── POST: api/tasks ─────────────────────────────────────────────────
        [HttpPost]
        public async Task<ActionResult<ApiResponse<TaskItem>>> CreateTask([FromBody] TaskItem newTask)
        {
            newTask.Id        = Guid.NewGuid();
            newTask.CreatedAt = DateTime.UtcNow;
            newTask.UpdatedAt = DateTime.UtcNow;

            _context.Tasks.Add(newTask);
            await _context.SaveChangesAsync();

            // ── Email the creator a confirmation (respects TaskNotifications pref) ──
            if (!string.IsNullOrWhiteSpace(newTask.CreatedBy))
            {
                if (Guid.TryParse(newTask.CreatedBy, out var creatorGuid))
                {
                    var creator = await _context.Users.FindAsync(creatorGuid);
                    if (creator != null)
                    {
                        var prefs = await _context.UserSettings
                            .FirstOrDefaultAsync(s => s.UserId == newTask.CreatedBy);

                        bool emailOn = prefs == null || prefs.EmailNotifications;
                        bool taskOn  = prefs == null || prefs.TaskNotifications;

                        if (emailOn && taskOn)
                        {
                            var dueDateStr = newTask.DueDate.HasValue
                                ? newTask.DueDate.Value.ToString("dd MMM yyyy")
                                : null;

                            _ = _emailService.SendTaskCreatedAsync(
                                creator.Email,
                                creator.DisplayName,
                                newTask.Title,
                                newTask.Priority,
                                dueDateStr);
                        }
                    }
                }
            }

            return Ok(new ApiResponse<TaskItem> { Success = true, Data = newTask });
        }

        // ── PUT: api/tasks/{id} ─────────────────────────────────────────────
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<TaskItem>>> UpdateTask(
            Guid id, [FromBody] TaskItem updatedTask)
        {
            if (id != updatedTask.Id)
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Error   = new { message = "ID mismatch" }
                });

            // Capture old status before applying changes
            var existingTask = await _context.Tasks
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == id);

            if (existingTask == null)
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Error   = new { message = "Task not found" }
                });

            var oldStatus = existingTask.Status;

            updatedTask.UpdatedAt = DateTime.UtcNow;
            _context.Entry(updatedTask).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TaskExists(id))
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Error   = new { message = "Task not found" }
                    });
                throw;
            }

            // ── If status changed, notify the task creator ──────────────────
            if (oldStatus != updatedTask.Status
                && !string.IsNullOrWhiteSpace(updatedTask.CreatedBy))
            {
                if (Guid.TryParse(updatedTask.CreatedBy, out var creatorGuid))
                {
                    var creator = await _context.Users.FindAsync(creatorGuid);
                    if (creator != null)
                    {
                        var prefs = await _context.UserSettings
                            .FirstOrDefaultAsync(s => s.UserId == updatedTask.CreatedBy);

                        bool emailOn = prefs == null || prefs.EmailNotifications;
                        bool taskOn  = prefs == null || prefs.TaskNotifications;

                        if (emailOn && taskOn)
                        {
                            // Resolve who updated it from the JWT claims
                            var actorName = User.FindFirst("displayName")?.Value
                                         ?? User.FindFirst("email")?.Value
                                         ?? "Someone";

                            _ = _emailService.SendTaskStatusUpdatedAsync(
                                creator.Email,
                                creator.DisplayName,
                                updatedTask.Title,
                                updatedTask.Status,
                                actorName);
                        }
                    }
                }
            }

            return Ok(new ApiResponse<TaskItem> { Success = true, Data = updatedTask });
        }

        // ── DELETE: api/tasks/{id} ──────────────────────────────────────────
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<string>>> DeleteTask(Guid id)
        {
            var task = await _context.Tasks.FindAsync(id);

            if (task == null)
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Error   = new { message = "Task not found" }
                });

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<string>
            {
                Success = true,
                Data    = $"Task '{task.Title}' deleted successfully."
            });
        }

        // ── Helper ──────────────────────────────────────────────────────────
        private bool TaskExists(Guid id)
        {
            return _context.Tasks.Any(e => e.Id == id);
        }
    }
}