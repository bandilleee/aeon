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
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TasksController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<TaskItem>>>> GetTasks()
        {
            var tasks = await _context.Tasks.ToListAsync();
            
            // Wrap the list of tasks inside the Data property of our new wrapper
            return Ok(new ApiResponse<IEnumerable<TaskItem>> { Success = true, Data = tasks });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<TaskItem>>> GetTask(Guid id)
        {
            var task = await _context.Tasks.FindAsync(id);

            if (task == null)
            {
                return NotFound(new ApiResponse<object> { Success = false, Error = new { message = "Task not found" } });
            }

            return Ok(new ApiResponse<TaskItem> { Success = true, Data = task });
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<TaskItem>>> CreateTask(TaskItem newTask)
        {
            newTask.Id = Guid.NewGuid();
            newTask.CreatedAt = DateTime.UtcNow;
            newTask.UpdatedAt = DateTime.UtcNow;

            _context.Tasks.Add(newTask);
            await _context.SaveChangesAsync();

            // Return the newly created task perfectly wrapped
            return Ok(new ApiResponse<TaskItem> { Success = true, Data = newTask });
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<TaskItem>>> UpdateTask(Guid id, TaskItem updatedTask)
        {
            if (id != updatedTask.Id)
            {
                return BadRequest(new ApiResponse<object> { Success = false, Error = new { message = "ID mismatch" } });
            }

            _context.Entry(updatedTask).State = EntityState.Modified;
            updatedTask.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TaskExists(id))
                {
                    return NotFound(new ApiResponse<object> { Success = false, Error = new { message = "Task not found" } });
                }
                else
                {
                    throw;
                }
            }

            // Instead of returning No Content, we return a success wrapper with the updated data
            return Ok(new ApiResponse<TaskItem> { Success = true, Data = updatedTask });
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<string>>> DeleteTask(Guid id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
            {
                return NotFound(new ApiResponse<object> { Success = false, Error = new { message = "Task not found" } });
            }

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            // Return a nice success message string inside the wrapper
            return Ok(new ApiResponse<string> { Success = true, Data = "Task deleted successfully" });
        }

        private bool TaskExists(Guid id)
        {
            return _context.Tasks.Any(e => e.Id == id);
        }
    }
}