using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OrgManager.Api.Data;
using OrgManager.Api.Models;

namespace OrgManager.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // ==================== LOGIN ====================
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            
            if (!isPasswordValid)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            // Update last login time
            user.LastLoginAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Generate JWT Token
            var token = GenerateJwtToken(user);

            // Return in the format the frontend expects
            return Ok(new { 
                Token = token,  // Capital T to match frontend
                User = new {
                    Id = user.Id,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    DisplayName = user.DisplayName,
                    Role = user.Role,
                    Status = user.Status,
                    AvatarUrl = user.AvatarUrl
                }
            });
        }

        // ==================== REGISTER ====================
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            // Check if email already exists
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (existingUser != null)
            {
                return BadRequest(new { message = "An account with this email already exists." });
            }

            // Create new user
            var newUser = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                FirstName = request.FirstName,
                LastName = request.LastName,
                DisplayName = $"{request.FirstName} {request.LastName}",
                Role = "member",       // Default role
                Status = "pending",    // Needs admin approval
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object> { 
                Success = true, 
                Data = new { message = "Registration successful! Your account is pending approval." }
            });
        }

                // ==================== REQUEST ACCESS ====================
        [HttpPost("request-access")]
        public async Task<IActionResult> RequestAccess([FromBody] RequestAccessDto request)
        {
            // Check if a request from this email already exists
            var existingRequest = await _context.AccessRequests
                .FirstOrDefaultAsync(r => r.Email == request.Email && r.Status == "pending");
            
            if (existingRequest != null)
            {
                return BadRequest(new { message = "A request from this email is already pending review." });
            }

            // Also block if they're already a user
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (existingUser != null)
            {
                return BadRequest(new { message = "An account with this email already exists." });
            }

            var accessRequest = new AccessRequest
            {
                Id = Guid.NewGuid(),
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Reason = request.Reason,
                Status = "pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.AccessRequests.Add(accessRequest);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object> 
            { 
                Success = true, 
                Data = new { message = "Your access request has been submitted. An admin will review it shortly." }
            });
        }

        // ==================== GET CURRENT USER ====================
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            // Get user ID from JWT claims
            var userIdClaim = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid token" });
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(new ApiResponse<object> { 
                Success = true, 
                Data = new {
                    Id = user.Id,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    DisplayName = user.DisplayName,
                    Role = user.Role,
                    Status = user.Status,
                    AvatarUrl = user.AvatarUrl
                }
            });
        }

        // ==================== HELPER: Generate JWT Token ====================
        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["JwtSettings:SecretKey"]!);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("id", user.Id.ToString()),
                    new Claim("email", user.Email),
                    new Claim("role", user.Role),
                    new Claim("displayName", user.DisplayName)
                }),
                Expires = DateTime.UtcNow.AddDays(7), // Token valid for 7 days
                Issuer = _configuration["JwtSettings:Issuer"],
                Audience = _configuration["JwtSettings:Audience"],
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key), 
                    SecurityAlgorithms.HmacSha256Signature
                )
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }

    // ==================== REQUEST DTOs ====================
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
    }

    public class RequestAccessDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
}
}