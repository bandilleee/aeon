namespace OrgManager.Api.Models
{
    public class Event
    {
        // --- YOUR EXISTING FIELDS ---
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = "other";
        
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsVirtual { get; set; }
        
        public string Status { get; set; } = "draft";
        public string Visibility { get; set; } = "public";
        
        // This stores the ID of the user who created the event
        public string CreatedBy { get; set; } = string.Empty; 
        
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // --- NEW ENTERPRISE EVENT FIELDS ---
        public string? Location { get; set; }
        public string? VirtualLink { get; set; }
        
        public bool RequiresRegistration { get; set; } = true;
        public int? MaxAttendees { get; set; }
        public int CurrentAttendees { get; set; } = 0;

        // To support the rich UI without complex joins, we store minimal creator info (name, initials) as a JSON string
        public string CreatedByUserJson { get; set; } = "{}";

        // Approval Workflow Fields
        public string? ApprovedBy { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public string? RejectionReason { get; set; }
    }
}