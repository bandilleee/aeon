namespace OrgManager.Api.Models
{
    // The "<T>" means this wrapper is generic. It can hold a Task, an Event, 
    // a User, or a list of any of those things!
    public class ApiResponse<T>
    {
        public bool Success { get; set; } = true;
        public T? Data { get; set; }
        public object? Error { get; set; }
        
        // This automatically stamps the exact time the response was sent
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}