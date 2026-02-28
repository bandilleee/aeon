using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrgManager.Api.Data;
using OrgManager.Api.Models;
using System.Security.Claims;
using System.Text.Json;

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

        // --- UPGRADED SECURE CREATE METHOD ---
        [HttpPost]
        public async Task<ActionResult<ApiResponse<Event>>> CreateEvent([FromBody] CreateUserEventDto dto)
        {
            // 1. Grab the user's ID directly from their secure JWT token
            var userIdString = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdString))
            {
                return Unauthorized(new ApiResponse<object> { Success = false, Error = new { message = "Invalid token." } });
            }

            // 2. Fetch the user's details to embed a snapshot for the Admin UI
            var currentUser = await _context.Users.FindAsync(Guid.Parse(userIdString));
            var creatorJson = "{}";
            if (currentUser != null)
            {
                creatorJson = JsonSerializer.Serialize(new {
                    id = currentUser.Id.ToString(),
                    displayName = string.IsNullOrEmpty(currentUser.DisplayName) ? currentUser.Email.Split('@')[0] : currentUser.DisplayName,
                    email = currentUser.Email,
                    initials = string.IsNullOrEmpty(currentUser.FirstName) 
                        ? currentUser.Email.Substring(0, 2).ToUpper() 
                        : $"{currentUser.FirstName[0]}{currentUser.LastName[0]}".ToUpper()
                });
            }

            // 3. Create the event, ignoring frontend status and enforcing "pending_approval"
            var newEvent = new Event
            {
                Id = Guid.NewGuid(),
                Title = dto.Title,
                Description = dto.Description,
                Category = dto.Category,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                IsVirtual = dto.IsVirtual,
                Location = dto.Location,
                VirtualLink = dto.VirtualLink,
                Visibility = dto.Visibility,
                RequiresRegistration = dto.RequiresRegistration,
                MaxAttendees = dto.MaxAttendees,
                
                Status = "pending_approval", // SECURITY: Force it to pending!
                
                CreatedBy = userIdString,
                CreatedByUserJson = creatorJson,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

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

    // DTO to ensure the user can only submit safe fields
    public class CreateUserEventDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = "other";
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsVirtual { get; set; }
        public string? Location { get; set; }
        public string? VirtualLink { get; set; }
        public string Visibility { get; set; } = "public";
        public bool RequiresRegistration { get; set; } = true;
        public int? MaxAttendees { get; set; }
    }
}