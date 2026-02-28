using Microsoft.EntityFrameworkCore;
using OrgManager.Api.Models;

namespace OrgManager.Api.Data
{
    public static class DbInitializer
    {
        public static async Task InitializeAsync(AppDbContext context)
        {
            // Make sure database is created
            await context.Database.EnsureCreatedAsync();

            // Check if we already have users
            if (await context.Users.AnyAsync())
            {
                return; // Database has been seeded
            }

            // Create a default admin user
            // Password is: Admin@123
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

            // Create a test member user
            // Password is: Member@123
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

            Console.WriteLine("   Database seeded with test users!");
            Console.WriteLine("   Admin: admin@aeon.com / Admin@123");
            Console.WriteLine("   Member: member@aeon.com / Member@123");
        }
    }
}