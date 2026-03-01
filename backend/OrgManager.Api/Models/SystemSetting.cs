namespace OrgManager.Api.Models
{
    public class SystemSetting
    {
        public int Id { get; set; } = 1; // Always a single row
        public string SettingsJson { get; set; } = "{}";
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string? UpdatedBy { get; set; }
    }
}