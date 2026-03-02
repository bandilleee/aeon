using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrgManager.Api.Data;
using OrgManager.Api.Models;
using OrgManager.Api.Services;
using System.Text.Json;

namespace OrgManager.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/admin/events")]
    public class AdminEventsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;

        public AdminEventsController(AppDbContext context, EmailService emailService)
        {
            _context      = context;
            _emailService = emailService;
        }

        // ── GET ALL EVENTS ─────────────────────────────────────────────────
        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<object>>>> GetEvents()
        {
            var dbEvents = await _context.Events
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();

            var events = dbEvents.Select(e => new {
                id                   = e.Id.ToString(),
                title                = e.Title,
                description          = e.Description,
                category             = e.Category,
                startDate            = e.StartDate,
                endDate              = e.EndDate,
                status               = e.Status,
                isVirtual            = e.IsVirtual,
                location             = e.Location,
                virtualLink          = e.VirtualLink,
                visibility           = e.Visibility,
                requiresRegistration = e.RequiresRegistration,
                maxAttendees         = e.MaxAttendees,
                currentAttendees     = e.CurrentAttendees,
                createdBy            = e.CreatedBy,
                createdByUser        = JsonSerializer.Deserialize<object>(e.CreatedByUserJson ?? "{}"),
                createdAt            = e.CreatedAt,
                updatedAt            = e.UpdatedAt,
                approvedBy           = e.ApprovedBy,
                approvedAt           = e.ApprovedAt,
                rejectionReason      = e.RejectionReason
            });

            return Ok(new ApiResponse<IEnumerable<object>> { Success = true, Data = events });
        }

        // ── UPDATE EVENT STATUS (approve / reject / etc.) ──────────────────
        [HttpPut("{id}/status")]
        public async Task<ActionResult<ApiResponse<bool>>> UpdateEventStatus(
            Guid id, [FromBody] UpdateEventStatusDto dto)
        {
            var evt = await _context.Events.FindAsync(id);
            if (evt == null)
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Error   = new { message = "Event not found." }
                });

            // Capture actor from JWT claims
            var actorName  = User.FindFirst("displayName")?.Value
                          ?? User.FindFirst("name")?.Value
                          ?? "Admin";
            var actorEmail = User.FindFirst("email")?.Value ?? "";

            evt.Status    = dto.Status;
            evt.UpdatedAt = DateTime.UtcNow;

            if (dto.Status == "approved")
            {
                evt.ApprovedBy      = actorName;
                evt.ApprovedAt      = DateTime.UtcNow;
                evt.RejectionReason = null;
            }
            else if (dto.Status == "rejected")
            {
                evt.RejectionReason = dto.Reason;
                evt.ApprovedBy      = null;
                evt.ApprovedAt      = null;
            }

            await _context.SaveChangesAsync();

            // ── EMAIL NOTIFICATIONS ──────────────────────────────────────
            // Look up the event creator in the Users table and notify them
            if (!string.IsNullOrEmpty(evt.CreatedBy) &&
                Guid.TryParse(evt.CreatedBy, out var creatorGuid))
            {
                var creator = await _context.Users.FindAsync(creatorGuid);
                if (creator != null)
                {
                    if (dto.Status == "approved")
                    {
                        // Fire-and-forget — don't block the response for email
                        _ = _emailService.SendEventApprovedAsync(
                            creator.Email,
                            creator.DisplayName,
                            evt.Title
                        );
                    }
                    else if (dto.Status == "rejected")
                    {
                        _ = _emailService.SendEventRejectedAsync(
                            creator.Email,
                            creator.DisplayName,
                            evt.Title,
                            dto.Reason ?? "No reason was provided."
                        );
                    }
                }
            }

            return Ok(new ApiResponse<bool> { Success = true, Data = true });
        }

        // ── GET ATTENDEES FOR AN EVENT ─────────────────────────────────────
        [HttpGet("{eventId}/attendees")]
        public async Task<ActionResult<ApiResponse<IEnumerable<object>>>> GetAttendees(Guid eventId)
        {
            var dbAttendees = await _context.EventAttendees
                .Where(a => a.EventId == eventId)
                .OrderBy(a => a.RegisteredAt)
                .ToListAsync();

            var attendees = dbAttendees.Select(a => new {
                id           = a.Id.ToString(),
                eventId      = a.EventId.ToString(),
                userId       = a.UserId,
                user         = JsonSerializer.Deserialize<object>(a.UserJson ?? "{}"),
                status       = a.Status,
                registeredAt = a.RegisteredAt,
                checkedInBy  = a.CheckedInBy,
                checkedInAt  = a.CheckedInAt
            });

            return Ok(new ApiResponse<IEnumerable<object>> { Success = true, Data = attendees });
        }

        // ── ADD ATTENDEE (admin manually adds someone) ─────────────────────
        [HttpPost("{eventId}/attendees")]
        public async Task<ActionResult<ApiResponse<object>>> AddAttendee(
            Guid eventId, [FromBody] CreateAttendeeDto dto)
        {
            var newAttendee = new EventAttendee
            {
                Id           = Guid.NewGuid(),
                EventId      = eventId,
                UserId       = dto.UserId,
                UserJson     = JsonSerializer.Serialize(dto.User),
                Status       = dto.Status,
                RegisteredAt = DateTime.UtcNow
            };

            _context.EventAttendees.Add(newAttendee);

            // Increment the event's current attendee count
            var evt = await _context.Events.FindAsync(eventId);
            if (evt != null)
            {
                evt.CurrentAttendees++;
                evt.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data    = new { id = newAttendee.Id.ToString() }
            });
        }

        // ── UPDATE ATTENDEE STATUS (check-in, no-show, cancelled, etc.) ────
        [HttpPut("attendees/{attendeeId}/status")]
        public async Task<ActionResult<ApiResponse<bool>>> UpdateAttendeeStatus(
            Guid attendeeId, [FromBody] UpdateAttendeeStatusDto dto)
        {
            var attendee = await _context.EventAttendees.FindAsync(attendeeId);
            if (attendee == null)
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Error   = new { message = "Attendee not found." }
                });

            attendee.Status = dto.Status;

            if (dto.Status == "checked_in")
            {
                attendee.CheckedInAt = DateTime.UtcNow;
                attendee.CheckedInBy = User.FindFirst("displayName")?.Value
                                    ?? User.FindFirst("name")?.Value
                                    ?? "Admin";
            }

            await _context.SaveChangesAsync();
            return Ok(new ApiResponse<bool> { Success = true, Data = true });
        }

        // ── REMOVE ATTENDEE ────────────────────────────────────────────────
        [HttpDelete("attendees/{attendeeId}")]
        public async Task<ActionResult<ApiResponse<bool>>> RemoveAttendee(Guid attendeeId)
        {
            var attendee = await _context.EventAttendees.FindAsync(attendeeId);
            if (attendee == null)
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Error   = new { message = "Attendee not found." }
                });

            _context.EventAttendees.Remove(attendee);

            // Decrement the event's current attendee count
            var evt = await _context.Events.FindAsync(attendee.EventId);
            if (evt != null && evt.CurrentAttendees > 0)
            {
                evt.CurrentAttendees--;
                evt.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(new ApiResponse<bool> { Success = true, Data = true });
        }
    }

    // ── DTOs ───────────────────────────────────────────────────────────────────

    /// <summary>Used by PUT /api/admin/events/{id}/status</summary>
    public class UpdateEventStatusDto
    {
        public string  Status { get; set; } = string.Empty;
        public string? Reason { get; set; }
    }

    /// <summary>Used by POST /api/admin/events/{eventId}/attendees</summary>
    public class CreateAttendeeDto
    {
        public string UserId { get; set; } = string.Empty;
        public object User   { get; set; } = new();
        public string Status { get; set; } = "registered";
    }

    /// <summary>Used by PUT /api/admin/events/attendees/{attendeeId}/status</summary>
    public class UpdateAttendeeStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }
}