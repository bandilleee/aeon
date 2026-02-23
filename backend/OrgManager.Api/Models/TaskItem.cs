namespace OrgManager.Api.Models
{
    public class TaskItem
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = "todo";
        public string Priority { get; set; } = "medium";
        
        // The "?" means a task might not have a due date
        public DateTime? DueDate { get; set; } 
        
        public string CreatedBy { get; set; } = string.Empty;
        
        // If this task is connected to a specific event, we store the Event's ID here
        public Guid? EventId { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}