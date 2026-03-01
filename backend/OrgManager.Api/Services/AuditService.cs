using OrgManager.Api.Data;
using OrgManager.Api.Models;
using System.Text.Json;

namespace OrgManager.Api.Services
{
    public class AuditService
    {
        private readonly AppDbContext _context;

        public AuditService(AppDbContext context)
        {
            _context = context;
        }

        public async Task LogAsync(
            string actionCode,
            string action,
            string category,
            string description,
            string actorId = "system",
            string actorName = "System",
            string actorEmail = "system@aeon.com",
            string actorRole = "system",
            string severity = "info",
            string result = "success",
            string? targetType = null,
            string? targetId = null,
            string? targetName = null,
            Dictionary<string, string>? metadata = null,
            List<(string field, string oldValue, string newValue)>? changes = null,
            string ipAddress = "127.0.0.1",
            string? userAgent = null,
            string? sessionId = null
        )
        {
            var initials = actorName.Split(' ')
                .Where(w => w.Length > 0)
                .Take(2)
                .Aggregate("", (acc, w) => acc + w[0])
                .ToUpper();

            var log = new AuditLog
            {
                Id = Guid.NewGuid(),
                Timestamp = DateTime.UtcNow,
                ActorId = actorId,
                ActorName = actorName,
                ActorEmail = actorEmail,
                ActorRole = actorRole,
                ActorInitials = initials,
                Action = action,
                ActionCode = actionCode,
                Category = category,
                Severity = severity,
                Result = result,
                TargetType = targetType,
                TargetId = targetId,
                TargetName = targetName,
                Description = description,
                IpAddress = ipAddress,
                UserAgent = userAgent,
                SessionId = sessionId,
                MetadataJson = metadata != null
                    ? JsonSerializer.Serialize(metadata)
                    : null,
                ChangesJson = changes != null
                    ? JsonSerializer.Serialize(changes.Select(c => new { field = c.field, oldValue = c.oldValue, newValue = c.newValue }))
                    : null,
            };

            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();
        }
    }
}