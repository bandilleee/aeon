namespace OrgManager.Api.Models
{
    public class AccessRequest
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        
        // "pending" | "approved" | "rejected"
        public string Status { get; set; } = "pending";
        
        // Set when admin takes action
        public string? ReviewedBy { get; set; }
        public string? ReviewNote { get; set; }
        public DateTime? ReviewedAt { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}