namespace OrgManager.Api.Models
{
    public class TaskComment
    {
        public Guid Id { get; set; }
        public Guid TaskId { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // We will store the user info right on the comment to keep it simple!
        public string UserId { get; set; } = string.Empty;
        public string UserDisplayName { get; set; } = string.Empty;
        public string UserInitials { get; set; } = string.Empty;
    }
}