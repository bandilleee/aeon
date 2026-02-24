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
    public class EventsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EventsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<Event>>>> GetEvents()
        {
            var events = await _context.Events.ToListAsync();
            return Ok(new ApiResponse<IEnumerable<Event>> { Success = true, Data = events });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<Event>>> GetEvent(Guid id)
        {
            var ev = await _context.Events.FindAsync(id);

            if (ev == null)
            {
                return NotFound(new ApiResponse<object> { Success = false, Error = new { message = "Event not found" } });
            }

            return Ok(new ApiResponse<Event> { Success = true, Data = ev });
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<Event>>> CreateEvent(Event newEvent)
        {
            newEvent.Id = Guid.NewGuid();
            newEvent.CreatedAt = DateTime.UtcNow;
            newEvent.UpdatedAt = DateTime.UtcNow;

            _context.Events.Add(newEvent);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<Event> { Success = true, Data = newEvent });
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<Event>>> UpdateEvent(Guid id, Event updatedEvent)
        {
            if (id != updatedEvent.Id)
            {
                return BadRequest(new ApiResponse<object> { Success = false, Error = new { message = "ID mismatch" } });
            }

            _context.Entry(updatedEvent).State = EntityState.Modified;
            updatedEvent.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EventExists(id))
                {
                    return NotFound(new ApiResponse<object> { Success = false, Error = new { message = "Event not found" } });
                }
                else
                {
                    throw;
                }
            }

            return Ok(new ApiResponse<Event> { Success = true, Data = updatedEvent });
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<string>>> DeleteEvent(Guid id)
        {
            var ev = await _context.Events.FindAsync(id);
            if (ev == null)
            {
                return NotFound(new ApiResponse<object> { Success = false, Error = new { message = "Event not found" } });
            }

            _context.Events.Remove(ev);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<string> { Success = true, Data = "Event deleted successfully" });
        }

        private bool EventExists(Guid id)
        {
            return _context.Events.Any(e => e.Id == id);
        }
    }
}