using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OrgManager.Api.Data;
using OrgManager.Api.Models; // Added this to use your ApiResponse and other models

namespace OrgManager.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // URL will be /api/auth
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        // We give this waiter access to the database AND the app settings (for the secret key)
        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // --- 1. YOUR EXISTING LOGIN LOGIC ---
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            
            // 1. Check if the user exists
            if (user == null) return Unauthorized(new { message = "Invalid email or password." }); 

            // 2. Check the password
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            if (!isPasswordValid) return Unauthorized(new { message = "Invalid email or password." });

            // 3. Grab the secret key (Check to make sure it exists!)
            var secretKeyString = _configuration["JwtSettings:SecretKey"];
            if (string.IsNullOrEmpty(secretKeyString))
            {
                return StatusCode(500, new { message = "Server Error: JWT Secret Key is missing in appsettings.json!" });
            }

            // 4. Create the JWT Token
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(secretKeyString);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("id", user.Id.ToString()),
                    new Claim("email", user.Email),
                    new Claim("role", user.Role)
                }),
                Expires = DateTime.UtcNow.AddDays(1),
                Issuer = _configuration["JwtSettings:Issuer"],
                Audience = _configuration["JwtSettings:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            // 5. CRITICAL FIX: Wrap it in the standard ApiResponse so the frontend can parse it!
            return Ok(new ApiResponse<object> { 
                Success = true, 
                Data = new { 
                    token = tokenString,  // Lowercase 't' to match frontend expectations
                    user = user 
                } 
            });
        }

        // --- TEMPORARY SEED ENDPOINT TO CREATE A VALID ACCOUNT ---
        [HttpPost("seed")]
        public async Task<IActionResult> SeedAdminUser()
        {
            // Check if admin already exists
            if (await _context.Users.AnyAsync(u => u.Email == "admin@aeon.com"))
            {
                return Ok(new { Message = "Admin user already exists! Use admin@aeon.com / Admin123!" });
            }

            var adminUser = new User
            {
                Id = Guid.NewGuid(),
                Email = "admin@aeon.com",
                // Notice how we use BCrypt to hash it properly!
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"), 
                Role = "admin"
            };

            _context.Users.Add(adminUser);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Success! You can now log in with Email: admin@aeon.com | Password: Admin123!" });
        }

        // --- 2. NEW: REQUEST ACCESS ---
        [HttpPost("request-access")]
        public async Task<ActionResult<ApiResponse<string>>> RequestAccess([FromBody] AccessRequestDto request)
        {
            // In a production app, you would save this to an "AccessRequests" table for admin review.
            // For now, we simulate processing time and return success so the UI works perfectly.
            await Task.Delay(1000); 
            
            return Ok(new ApiResponse<string> { 
                Success = true, 
                Data = "Request received successfully. An admin will review it." 
            });
        }

        // --- 3. NEW: FORGOT PASSWORD ---
        [HttpPost("forgot-password")]
        public async Task<ActionResult<ApiResponse<string>>> ForgotPassword([FromBody] ForgotPasswordDto request)
        {
            // In production, you'd generate a reset token and email it via SendGrid/SMTP.
            await Task.Delay(1000); 
            
            // Security best practice: Always return success so hackers can't guess if emails exist.
            return Ok(new ApiResponse<string> { 
                Success = true, 
                Data = "If an account exists, a reset link was sent." 
            });
        }

        // --- 4. NEW: VERIFY 2FA ---
        [HttpPost("verify-2fa/{userId}")]
        public async Task<ActionResult<ApiResponse<bool>>> Verify2FA(string userId, [FromBody] TwoFactorDto request)
        {
            await Task.Delay(500);

            // Mock validation: reject if they type "123456", otherwise accept.
            // In production, you would validate the TOTP code against their saved Secret Key.
            if (request.Code == "123456") 
            {
                return BadRequest(new ApiResponse<object> { 
                    Success = false, 
                    Error = new { message = "Invalid code" }
                });
            }

            return Ok(new ApiResponse<bool> { Success = true, Data = true });
        }
    }

    // ==========================================
    // DATA TRANSFER OBJECTS (DTOs)
    // ==========================================

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class AccessRequestDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public bool AgreeToTerms { get; set; }
    }

    public class ForgotPasswordDto
    {
        public string Email { get; set; } = string.Empty;
    }

    public class TwoFactorDto
    {
        public string Code { get; set; } = string.Empty;
    }
}