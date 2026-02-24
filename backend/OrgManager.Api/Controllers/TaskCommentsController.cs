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
    public class TaskCommentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TaskCommentsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/taskcomments/task/{taskId}
        [HttpGet("task/{taskId}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<TaskComment>>>> GetCommentsForTask(Guid taskId)
        {
            var comments = await _context.TaskComments
                .Where(c => c.TaskId == taskId)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();

            return Ok(new ApiResponse<IEnumerable<TaskComment>> { Success = true, Data = comments });
        }

        // POST: api/taskcomments
        [HttpPost]
        public async Task<ActionResult<ApiResponse<TaskComment>>> CreateComment(TaskComment newComment)
        {
            newComment.Id = Guid.NewGuid();
            newComment.CreatedAt = DateTime.UtcNow;

            _context.TaskComments.Add(newComment);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<TaskComment> { Success = true, Data = newComment });
        }
    }
}