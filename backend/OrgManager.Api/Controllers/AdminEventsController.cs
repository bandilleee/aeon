using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrgManager.Api.Data;
using OrgManager.Api.Models;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;

namespace OrgManager.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/admin/events")] 
    public class AdminEventsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminEventsController(AppDbContext context)
        {
            _context = context;
        }

        // --- 1. EVENTS ---

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<object>>>> GetEvents()
        {
            var dbEvents = await _context.Events.ToListAsync();
            
            var events = dbEvents.Select(e => new {
                id = e.Id.ToString(),
                title = e.Title,
                description = e.Description,
                category = e.Category,
                startDate = e.StartDate,
                endDate = e.EndDate,
                status = e.Status,
                isVirtual = e.IsVirtual,
                location = e.Location,
                virtualLink = e.VirtualLink,
                visibility = e.Visibility,
                requiresRegistration = e.RequiresRegistration,
                maxAttendees = e.MaxAttendees,
                currentAttendees = e.CurrentAttendees,
                createdByUser = JsonSerializer.Deserialize<object>(e.CreatedByUserJson),
                createdAt = e.CreatedAt,
                updatedAt = e.UpdatedAt,
                approvedBy = e.ApprovedBy,
                approvedAt = e.ApprovedAt,
                rejectionReason = e.RejectionReason
            });

            return Ok(new ApiResponse<IEnumerable<object>> { Success = true, Data = events });
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult<ApiResponse<bool>>> UpdateEventStatus(Guid id, [FromBody] UpdateEventStatusDto dto)
        {
            var evt = await _context.Events.FindAsync(id);
            if (evt == null) return NotFound();

            evt.Status = dto.Status;
            evt.UpdatedAt = DateTime.UtcNow;

            if (dto.Status == "approved")
            {
                evt.ApprovedBy = "Admin"; // In real app, grab from JWT token
                evt.ApprovedAt = DateTime.UtcNow;
            }
            else if (dto.Status == "rejected")
            {
                evt.RejectionReason = dto.Reason;
            }

            await _context.SaveChangesAsync();
            return Ok(new ApiResponse<bool> { Success = true, Data = true });
        }

        // --- 2. ATTENDEES ---

        [HttpGet("{eventId}/attendees")]
        public async Task<ActionResult<ApiResponse<IEnumerable<object>>>> GetAttendees(Guid eventId)
        {
            var dbAttendees = await _context.EventAttendees
                                            .Where(a => a.EventId == eventId)
                                            .ToListAsync();

            var attendees = dbAttendees.Select(a => new {
                id = a.Id.ToString(),
                eventId = a.EventId.ToString(),
                userId = a.UserId,
                user = JsonSerializer.Deserialize<object>(a.UserJson),
                status = a.Status,
                registeredAt = a.RegisteredAt,
                checkedInBy = a.CheckedInBy,
                checkedInAt = a.CheckedInAt
            });

            return Ok(new ApiResponse<IEnumerable<object>> { Success = true, Data = attendees });
        }

        [HttpPost("{eventId}/attendees")]
        public async Task<ActionResult<ApiResponse<object>>> AddAttendee(Guid eventId, [FromBody] CreateAttendeeDto dto)
        {
            var newAttendee = new EventAttendee
            {
                Id = Guid.NewGuid(),
                EventId = eventId,
                UserId = dto.UserId,
                UserJson = JsonSerializer.Serialize(dto.User),
                Status = dto.Status,
                RegisteredAt = DateTime.UtcNow
            };

            _context.EventAttendees.Add(newAttendee);

            // Update event count
            var evt = await _context.Events.FindAsync(eventId);
            if (evt != null)
            {
                evt.CurrentAttendees += 1;
            }

            await _context.SaveChangesAsync();
            return Ok(new ApiResponse<object> { Success = true, Data = new { id = newAttendee.Id } });
        }

        [HttpPut("attendees/{attendeeId}/status")]
        public async Task<ActionResult<ApiResponse<bool>>> UpdateAttendeeStatus(Guid attendeeId, [FromBody] UpdateAttendeeStatusDto dto)
        {
            var attendee = await _context.EventAttendees.FindAsync(attendeeId);
            if (attendee == null) return NotFound();

            attendee.Status = dto.Status;
            if (dto.Status == "checked_in")
            {
                attendee.CheckedInAt = DateTime.UtcNow;
                attendee.CheckedInBy = "Admin";
            }

            await _context.SaveChangesAsync();
            return Ok(new ApiResponse<bool> { Success = true, Data = true });
        }

        [HttpDelete("attendees/{attendeeId}")]
        public async Task<ActionResult<ApiResponse<bool>>> RemoveAttendee(Guid attendeeId)
        {
            var attendee = await _context.EventAttendees.FindAsync(attendeeId);
            if (attendee == null) return NotFound();

            _context.EventAttendees.Remove(attendee);

            var evt = await _context.Events.FindAsync(attendee.EventId);
            if (evt != null && evt.CurrentAttendees > 0)
            {
                evt.CurrentAttendees -= 1;
            }

            await _context.SaveChangesAsync();
            return Ok(new ApiResponse<bool> { Success = true, Data = true });
        }
    }

    public class UpdateEventStatusDto
    {
        public string Status { get; set; } = string.Empty;
        public string? Reason { get; set; }
    }

    public class CreateAttendeeDto
    {
        public string UserId { get; set; } = string.Empty;
        public object User { get; set; } = new();
        public string Status { get; set; } = "registered";
    }

    public class UpdateAttendeeStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }
}