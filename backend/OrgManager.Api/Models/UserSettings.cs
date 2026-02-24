namespace OrgManager.Api.Models
{
    public class UserSettings
    {
        public Guid Id { get; set; }
        
        // This links the settings to the specific logged-in user (e.g., "user_1")
        public string UserId { get; set; } = string.Empty; 

        // --- Profile Fields ---
        public string DisplayName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public string AvatarUrl { get; set; } = string.Empty;
        
        // --- Notification Fields ---
        public bool EmailNotifications { get; set; } = true;
        public bool EventNotifications { get; set; } = true;
        public bool TaskNotifications { get; set; } = false;
        public bool MemberNotifications { get; set; } = true;
        
        // --- Security Fields ---
        public bool TwoFactorEnabled { get; set; } = false;
    }
}