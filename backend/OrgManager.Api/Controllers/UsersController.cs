using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrgManager.Api.Data;
using OrgManager.Api.Models;

namespace OrgManager.Api.Controllers
{
    // These brackets tell the app that this class is an API Controller, 
    // and its web address will be something like "http://localhost:5000/api/users"
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        // This is called "Dependency Injection". 
        // It's just a fancy way of giving our Waiter the keys to the Pantry (the database).
        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/users
        // This method handles requests asking to see the list of users.
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            // Go to the database, get all users, and hand them back as a list
            return await _context.Users.ToListAsync();
        }

        // POST: api/users
        // This method handles requests asking to create a brand new user.
        [HttpPost]
        public async Task<ActionResult<User>> CreateUser(User user)
        {
            user.Id = Guid.NewGuid();
            user.CreatedAt = DateTime.UtcNow;
            user.UpdatedAt = DateTime.UtcNow;

            // NEW: Scramble the default password for now when we create a user.
            // (Later we will pass a real password from the frontend registration form)
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123");

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUsers), new { id = user.Id }, user);
        }
    }
}