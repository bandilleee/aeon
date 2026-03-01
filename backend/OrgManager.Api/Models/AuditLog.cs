namespace OrgManager.Api.Models
{
    public class AuditLog
    {
        public Guid Id { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        // Actor (who did it)
        public string ActorId { get; set; } = string.Empty;
        public string ActorName { get; set; } = string.Empty;
        public string ActorEmail { get; set; } = string.Empty;
        public string ActorRole { get; set; } = string.Empty;
        public string ActorInitials { get; set; } = string.Empty;

        // Action
        public string Action { get; set; } = string.Empty;
        public string ActionCode { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;   // authentication, user_management, etc.
        public string Severity { get; set; } = "info";          // info, warning, critical
        public string Result { get; set; } = "success";         // success, failure, partial

        // Target (what was acted on)
        public string? TargetType { get; set; }
        public string? TargetId { get; set; }
        public string? TargetName { get; set; }

        // Details
        public string Description { get; set; } = string.Empty;
        public string? MetadataJson { get; set; }   // serialized dict
        public string? ChangesJson { get; set; }    // serialized array of {field, oldValue, newValue}

        // Context
        public string IpAddress { get; set; } = string.Empty;
        public string? UserAgent { get; set; }
        public string? Location { get; set; }
        public string? SessionId { get; set; }
    }
}