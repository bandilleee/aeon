using Microsoft.EntityFrameworkCore;
using OrgManager.Api.Models;

namespace OrgManager.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        
        // Add these two new lines!
        public DbSet<Event> Events { get; set; }
        public DbSet<TaskItem> Tasks { get; set; }
        public DbSet<TaskComment> TaskComments { get; set; }
        public DbSet<Member> Members { get; set; }
        public DbSet<UserSettings> UserSettings { get; set; }
    }
}