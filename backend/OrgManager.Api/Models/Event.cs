namespace OrgManager.Api.Models
{
    public class Event
    {
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
    }
}