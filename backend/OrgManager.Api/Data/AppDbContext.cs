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
    }
}