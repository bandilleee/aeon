namespace OrgManager.Api.Models
{
    public class User
    {
        // "Guid" is C#'s way of making a long, unique string of characters for an ID
        public Guid Id { get; set; } 
        
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        
        // The "?" means this is optional. A user might not have a profile picture yet!
        public string? AvatarUrl { get; set; } 
        
        public string Role { get; set; } = "member";
        public string Status { get; set; } = "pending";
        
        // "DateTime" is the specific C# format for handling dates and times
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
    }
}