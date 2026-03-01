using Microsoft.EntityFrameworkCore;
using OrgManager.Api.Models;

namespace OrgManager.Api.Data
{
    public static class DbInitializer
    {
        public static async Task InitializeAsync(AppDbContext context)
        {
            // Run all pending migrations (creates tables fresh on a new DB)
            await context.Database.MigrateAsync();

            // Seed default users if none exist
            if (await context.Users.AnyAsync()) return;

            var adminUser = new User
            {
                Id = Guid.NewGuid(),
                Email = "admin@aeon.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                FirstName = "Admin",
                LastName = "User",
                DisplayName = "Admin User",
                Role = "admin",
                Status = "active",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var memberUser = new User
            {
                Id = Guid.NewGuid(),
                Email = "member@aeon.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Member@123"),
                FirstName = "Test",
                LastName = "Member",
                DisplayName = "Test Member",
                Role = "member",
                Status = "active",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            context.Users.AddRange(adminUser, memberUser);
            await context.SaveChangesAsync();

            Console.WriteLine("✅  Database seeded!");
            Console.WriteLine("   Admin:  admin@aeon.com  / Admin@123");
            Console.WriteLine("   Member: member@aeon.com / Member@123");
        }
    }
}