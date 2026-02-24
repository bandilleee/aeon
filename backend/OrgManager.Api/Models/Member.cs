namespace OrgManager.Api.Models
{
    public class Member
    {
        public Guid Id { get; set; }
        public string DisplayName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public string Initials { get; set; } = string.Empty;
        public string Status { get; set; } = "active"; // active, pending, banned, left
        public string Role { get; set; } = "member"; 
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastSeen { get; set; } = DateTime.UtcNow;
    }
}