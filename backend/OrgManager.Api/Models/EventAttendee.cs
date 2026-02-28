namespace OrgManager.Api.Models
{
    public class EventAttendee
    {
        public Guid Id { get; set; }
        public Guid EventId { get; set; }
        
        public string UserId { get; set; } = string.Empty; // Could be a real Guid or "manual_123"
        public string UserJson { get; set; } = "{}"; // Store {id, displayName, email, initials, phone}
        
        public string Status { get; set; } = "registered"; // registered, checked_in, cancelled, no_show
        
        public DateTime RegisteredAt { get; set; }
        public string? CheckedInBy { get; set; }
        public DateTime? CheckedInAt { get; set; }
    }
}