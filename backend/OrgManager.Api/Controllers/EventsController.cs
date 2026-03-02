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

        // ── GET ALL EVENTS ──────────────────────────────────────────────
        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<object>>>> GetEvents()
        {
            var dbEvents = await _context.Events
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();

            // Only return approved/active events for regular members
            var events = dbEvents
                .Where(e => e.Status == "approved" || e.Status == "completed")
                .Select(e => new {
                    id              = e.Id.ToString(),
                    title           = e.Title,
                    description     = e.Description,
                    category        = e.Category,
                    startDate       = e.StartDate,
                    endDate         = e.EndDate,
                    status          = e.Status,
                    isVirtual       = e.IsVirtual,
                    location        = e.Location,
                    virtualLink     = e.VirtualLink,
                    visibility      = e.Visibility,
                    requiresRegistration = e.RequiresRegistration,
                    maxAttendees    = e.MaxAttendees,
                    currentAttendees = e.CurrentAttendees,
                    createdBy       = e.CreatedBy,
                    createdByUser   = JsonSerializer.Deserialize<object>(e.CreatedByUserJson ?? "{}"),
                    createdAt       = e.CreatedAt,
                    updatedAt       = e.UpdatedAt,
                    approvedBy      = e.ApprovedBy,
                    approvedAt      = e.ApprovedAt
                });

            return Ok(new ApiResponse<IEnumerable<object>> { Success = true, Data = events });
        }

        // ── GET ONE EVENT ────────────────────────────────────────────────
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<object>>> GetEvent(Guid id)
        {
            var e = await _context.Events.FindAsync(id);
            if (e == null)
                return NotFound(new ApiResponse<object> { Success = false, Error = new { message = "Event not found" } });

            var result = new {
                id              = e.Id.ToString(),
                title           = e.Title,
                description     = e.Description,
                category        = e.Category,
                startDate       = e.StartDate,
                endDate         = e.EndDate,
                status          = e.Status,
                isVirtual       = e.IsVirtual,
                location        = e.Location,
                virtualLink     = e.VirtualLink,
                visibility      = e.Visibility,
                requiresRegistration = e.RequiresRegistration,
                maxAttendees    = e.MaxAttendees,
                currentAttendees = e.CurrentAttendees,
                createdBy       = e.CreatedBy,
                createdByUser   = JsonSerializer.Deserialize<object>(e.CreatedByUserJson ?? "{}"),
                createdAt       = e.CreatedAt,
                updatedAt       = e.UpdatedAt,
                approvedBy      = e.ApprovedBy,
                approvedAt      = e.ApprovedAt,
                rejectionReason = e.RejectionReason
            };

            return Ok(new ApiResponse<object> { Success = true, Data = result });
        }

        // ── CREATE EVENT (submitted as draft/pending_approval) ───────────
        [HttpPost]
        public async Task<ActionResult<ApiResponse<object>>> CreateEvent([FromBody] CreateUserEventDto dto)
        {
            var userIdString = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdString))
                return Unauthorized(new ApiResponse<object> { Success = false, Error = new { message = "Unauthorized" } });

            var userId = Guid.Parse(userIdString);
            var user   = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new ApiResponse<object> { Success = false, Error = new { message = "User not found" } });

            var createdByUserJson = JsonSerializer.Serialize(new {
                id          = user.Id.ToString(),
                displayName = user.DisplayName,
                email       = user.Email,
                initials    = user.DisplayName.Split(' ')
                                  .Where(w => w.Length > 0).Take(2)
                                  .Aggregate("", (acc, w) => acc + w[0]).ToUpper()
            });

            var newEvent = new Event
            {
                Id                   = Guid.NewGuid(),
                Title                = dto.Title,
                Description          = dto.Description,
                Category             = dto.Category,
                StartDate            = dto.StartDate,
                EndDate              = dto.EndDate,
                IsVirtual            = dto.IsVirtual,
                Location             = dto.Location,
                VirtualLink          = dto.VirtualLink,
                Visibility           = dto.Visibility,
                MaxAttendees         = dto.MaxAttendees,
                RequiresRegistration = dto.RequiresRegistration,
                Status               = "pending_approval", // always goes to approval
                CreatedBy            = user.Id.ToString(),
                CreatedByUserJson    = createdByUserJson,
                CreatedAt            = DateTime.UtcNow,
                UpdatedAt            = DateTime.UtcNow
            };

            _context.Events.Add(newEvent);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object> {
                Success = true,
                Data    = new { id = newEvent.Id.ToString(), message = "Event submitted for approval." }
            });
        }

        // ── UPDATE EVENT ─────────────────────────────────────────────────
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<object>>> UpdateEvent(Guid id, [FromBody] CreateUserEventDto dto)
        {
            var e = await _context.Events.FindAsync(id);
            if (e == null)
                return NotFound(new ApiResponse<object> { Success = false, Error = new { message = "Event not found" } });

            var userIdString = User.FindFirst("id")?.Value;
            // Only the creator or admin can edit
            if (e.CreatedBy != userIdString && User.FindFirst("role")?.Value != "admin")
                return Forbid();

            e.Title                = dto.Title;
            e.Description          = dto.Description;
            e.Category             = dto.Category;
            e.StartDate            = dto.StartDate;
            e.EndDate              = dto.EndDate;
            e.IsVirtual            = dto.IsVirtual;
            e.Location             = dto.Location;
            e.VirtualLink          = dto.VirtualLink;
            e.Visibility           = dto.Visibility;
            e.MaxAttendees         = dto.MaxAttendees;
            e.RequiresRegistration = dto.RequiresRegistration;
            e.UpdatedAt            = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new ApiResponse<object> { Success = true, Data = new { message = "Event updated." } });
        }

        // ── DELETE EVENT ─────────────────────────────────────────────────
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteEvent(Guid id)
        {
            var e = await _context.Events.FindAsync(id);
            if (e == null)
                return NotFound(new ApiResponse<object> { Success = false, Error = new { message = "Event not found" } });

            _context.Events.Remove(e);
            await _context.SaveChangesAsync();
            return Ok(new ApiResponse<bool> { Success = true, Data = true });
        }

        // ── SELF-REGISTER FOR EVENT ──────────────────────────────────────
        [HttpPost("{id}/register")]
        public async Task<ActionResult<ApiResponse<object>>> RegisterForEvent(Guid id)
        {
            var userIdString = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdString))
                return Unauthorized();

            var userId = Guid.Parse(userIdString);
            var user   = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new ApiResponse<object> { Success = false, Error = new { message = "User not found" } });

            var ev = await _context.Events.FindAsync(id);
            if (ev == null)
                return NotFound(new ApiResponse<object> { Success = false, Error = new { message = "Event not found" } });

            if (ev.Status != "approved")
                return BadRequest(new ApiResponse<object> { Success = false, Error = new { message = "Event is not open for registration." } });

            // Check if already registered
            var existing = await _context.EventAttendees
                .FirstOrDefaultAsync(a => a.EventId == id && a.UserId == userIdString);
            if (existing != null)
            {
                if (existing.Status == "cancelled")
                {
                    // Re-register
                    existing.Status       = "registered";
                    existing.RegisteredAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                    return Ok(new ApiResponse<object> { Success = true, Data = new { message = "Re-registered successfully." } });
                }
                return BadRequest(new ApiResponse<object> { Success = false, Error = new { message = "You are already registered for this event." } });
            }

            // Check capacity
            if (ev.MaxAttendees.HasValue && ev.CurrentAttendees >= ev.MaxAttendees.Value)
                return BadRequest(new ApiResponse<object> { Success = false, Error = new { message = "This event is full." } });

            var userJson = JsonSerializer.Serialize(new {
                id          = user.Id.ToString(),
                displayName = user.DisplayName,
                email       = user.Email,
                initials    = user.DisplayName.Split(' ')
                                  .Where(w => w.Length > 0).Take(2)
                                  .Aggregate("", (acc, w) => acc + w[0]).ToUpper()
            });

            var attendee = new EventAttendee
            {
                Id           = Guid.NewGuid(),
                EventId      = id,
                UserId       = userIdString,
                UserJson     = userJson,
                Status       = "registered",
                RegisteredAt = DateTime.UtcNow
            };

            _context.EventAttendees.Add(attendee);

            // Increment attendee count
            ev.CurrentAttendees++;
            ev.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object> {
                Success = true,
                Data    = new { attendeeId = attendee.Id.ToString(), message = "Successfully registered!" }
            });
        }

        // ── CANCEL OWN REGISTRATION ──────────────────────────────────────
        [HttpDelete("{id}/register")]
        public async Task<ActionResult<ApiResponse<bool>>> CancelRegistration(Guid id)
        {
            var userIdString = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdString))
                return Unauthorized();

            var attendee = await _context.EventAttendees
                .FirstOrDefaultAsync(a => a.EventId == id && a.UserId == userIdString);

            if (attendee == null)
                return NotFound(new ApiResponse<object> { Success = false, Error = new { message = "Registration not found." } });

            attendee.Status = "cancelled";

            // Decrement count
            var ev = await _context.Events.FindAsync(id);
            if (ev != null && ev.CurrentAttendees > 0)
            {
                ev.CurrentAttendees--;
                ev.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(new ApiResponse<bool> { Success = true, Data = true });
        }

        // ── GET EVENT ATTENDEES (for members viewing an event) ───────────
        [HttpGet("{id}/attendees")]
        public async Task<ActionResult<ApiResponse<IEnumerable<object>>>> GetAttendees(Guid id)
        {
            var dbAttendees = await _context.EventAttendees
                .Where(a => a.EventId == id && a.Status != "cancelled")
                .OrderBy(a => a.RegisteredAt)
                .ToListAsync();

            var attendees = dbAttendees.Select(a => new {
                id           = a.Id.ToString(),
                eventId      = a.EventId.ToString(),
                userId       = a.UserId,
                user         = JsonSerializer.Deserialize<object>(a.UserJson ?? "{}"),
                status       = a.Status,
                registeredAt = a.RegisteredAt,
                checkedInAt  = a.CheckedInAt
            });

            return Ok(new ApiResponse<IEnumerable<object>> { Success = true, Data = attendees });
        }

        private bool EventExists(Guid id) => _context.Events.Any(e => e.Id == id);
    }

    public class CreateUserEventDto
    {
        public string Title               { get; set; } = string.Empty;
        public string Description         { get; set; } = string.Empty;
        public string Category            { get; set; } = "other";
        public DateTime StartDate         { get; set; }
        public DateTime EndDate           { get; set; }
        public bool IsVirtual             { get; set; }
        public string? Location           { get; set; }
        public string? VirtualLink        { get; set; }
        public string Visibility          { get; set; } = "public";
        public bool RequiresRegistration  { get; set; } = true;
        public int? MaxAttendees          { get; set; }
    }
}