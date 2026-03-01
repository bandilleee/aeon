using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OrgManager.Api.Data;
using OrgManager.Api.Models;
using OrgManager.Api.Services;

namespace OrgManager.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly AuditService _auditService;

        public AuthController(AppDbContext context, IConfiguration configuration, AuditService auditService)
        {
            _context = context;
            _configuration = configuration;
            _auditService = auditService;
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
                // Log failed login attempt
                await _auditService.LogAsync(
                    actionCode: "AUTH_LOGIN_FAILED",
                    action: "Login Failed",
                    category: "authentication",
                    description: $"Failed login attempt for {request.Email}",
                    actorId: user.Id.ToString(),
                    actorName: user.DisplayName,
                    actorEmail: user.Email,
                    actorRole: user.Role,
                    severity: "warning",
                    result: "failure",
                    ipAddress: HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown"
                );
                return Unauthorized(new { message = "Invalid email or password." });
            }

            // Update last login time
            user.LastLoginAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Log successful login
            await _auditService.LogAsync(
                actionCode: "AUTH_LOGIN",
                action: "Login Successful",
                category: "authentication",
                description: $"{user.Email} logged in successfully",
                actorId: user.Id.ToString(),
                actorName: user.DisplayName,
                actorEmail: user.Email,
                actorRole: user.Role,
                severity: "info",
                result: "success",
                ipAddress: HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                userAgent: Request.Headers.UserAgent.ToString()
            );

            // Generate JWT Token
            var token = GenerateJwtToken(user);

            return Ok(new {
                Token = token,
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

        // ==================== REQUEST ACCESS ====================
        [HttpPost("request-access")]
        public async Task<IActionResult> RequestAccess([FromBody] RequestAccessDto request)
        {
            var existing = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (existing != null)
                return BadRequest(new ApiResponse<object> { Success = false, Error = new { message = "An account with this email already exists." } });

            var existingRequest = await _context.AccessRequests
                .FirstOrDefaultAsync(r => r.Email == request.Email && r.Status == "pending");
            if (existingRequest != null)
                return BadRequest(new ApiResponse<object> { Success = false, Error = new { message = "A pending request for this email already exists." } });

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

            return Ok(new ApiResponse<object> {
                Success = true,
                Data = new { message = "Your request has been submitted. An admin will review it shortly." }
            });
        }

        // ==================== REGISTER ====================
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (existingUser != null)
                return BadRequest(new { message = "An account with this email already exists." });

            var newUser = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                FirstName = request.FirstName,
                LastName = request.LastName,
                DisplayName = $"{request.FirstName} {request.LastName}",
                Role = "member",
                Status = "pending",
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

        // ==================== GET CURRENT USER ====================
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { message = "Invalid token" });

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found" });

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
                Expires = DateTime.UtcNow.AddDays(7),
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

    // ==================== DTOs ====================
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