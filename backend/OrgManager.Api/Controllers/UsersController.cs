using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrgManager.Api.Data;
using OrgManager.Api.Models;
using System.Text.Json; // Needed for permissions parsing

namespace OrgManager.Api.Controllers
{
    [ApiController]
    [Route("api/admin/users")] 
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/admin/users
        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<object>>>> GetUsers()
        {
            var dbUsers = await _context.Users.ToListAsync();
            
            var users = dbUsers.Select(u => new {
                id = u.Id.ToString(),
                email = u.Email,
                firstName = u.FirstName,
                lastName = u.LastName,
                displayName = string.IsNullOrEmpty(u.DisplayName) 
                    ? (string.IsNullOrEmpty(u.FirstName) ? u.Email.Split('@')[0] : $"{u.FirstName} {u.LastName}") 
                    : u.DisplayName,
                initials = string.IsNullOrEmpty(u.FirstName) ? u.Email.Substring(0, 2).ToUpper() : $"{u.FirstName[0]}{u.LastName[0]}".ToUpper(),
                avatarUrl = u.AvatarUrl,
                phone = u.Phone,
                role = u.Role,
                status = u.Status,
                twoFactorStatus = u.TwoFactorStatus,
                notes = u.Notes,
                tags = string.IsNullOrEmpty(u.Tags) ? new string[0] : u.Tags.Split(','),
                customPermissions = u.CustomPermissions,
                permissions = JsonSerializer.Deserialize<Dictionary<string, bool>>(string.IsNullOrEmpty(u.Permissions) ? "{}" : u.Permissions),
                statusReason = u.StatusReason,
                statusChangedAt = u.StatusChangedAt,
                failedLoginAttempts = u.FailedLoginAttempts,
                loginCount = u.LoginCount,
                lastLoginAt = u.LastLoginAt,
                lastActiveAt = u.LastActiveAt,
                mustChangePassword = u.MustChangePassword,
                passwordLastChanged = u.PasswordLastChanged,
                createdAt = u.CreatedAt,
                updatedAt = u.UpdatedAt
            });

            return Ok(new ApiResponse<IEnumerable<object>> { Success = true, Data = users });
        }

        // POST: api/admin/users
        [HttpPost]
        public async Task<ActionResult<ApiResponse<object>>> CreateUser([FromBody] CreateAdminUserDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            {
                return BadRequest(new ApiResponse<object> { Success = false, Error = new { message = "Email already exists" } });
            }

            var newUser = new User
            {
                Id = Guid.NewGuid(),
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                DisplayName = $"{dto.FirstName} {dto.LastName}".Trim(),
                Phone = dto.Phone,
                Role = dto.Role,
                Status = "active", // Activate by default from admin panel
                Notes = dto.Notes,
                Tags = dto.Tags != null ? string.Join(",", dto.Tags) : "",
                MustChangePassword = dto.MustChangePassword,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(
                    string.IsNullOrEmpty(dto.TemporaryPassword) ? "Password123!" : dto.TemporaryPassword
                ),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object> { 
                Success = true, 
                Data = new { message = "User created successfully", id = newUser.Id } 
            });
        }

        // PUT: api/admin/users/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> UpdateUser(Guid id, [FromBody] UpdateAdminUserDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.FirstName = dto.FirstName ?? user.FirstName;
            user.LastName = dto.LastName ?? user.LastName;
            user.DisplayName = $"{user.FirstName} {user.LastName}".Trim();
            user.Phone = dto.Phone ?? user.Phone;
            user.Role = dto.Role ?? user.Role;
            user.Notes = dto.Notes ?? user.Notes;
            if (dto.Tags != null) user.Tags = string.Join(",", dto.Tags);
            
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new ApiResponse<bool> { Success = true, Data = true });
        }

        // PUT: api/admin/users/{id}/status
        [HttpPut("{id}/status")]
        public async Task<ActionResult<ApiResponse<bool>>> UpdateStatus(Guid id, [FromBody] UpdateStatusDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();
            
            if (user.Email == "admin@aeon.com" && dto.Status != "active") 
            {
                return BadRequest(new ApiResponse<bool> { Success = false, Error = new { message = "Cannot suspend main admin." } });
            }

            user.Status = dto.Status;
            user.StatusReason = dto.Reason;
            user.StatusChangedAt = DateTime.UtcNow;
            
            if (dto.Status == "active") user.FailedLoginAttempts = 0; // Reset lockouts on manual activation
            
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new ApiResponse<bool> { Success = true, Data = true });
        }

        // PUT: api/admin/users/{id}/permissions
        [HttpPut("{id}/permissions")]
        public async Task<ActionResult<ApiResponse<bool>>> UpdatePermissions(Guid id, [FromBody] UpdatePermissionsDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.Permissions = JsonSerializer.Serialize(dto.Permissions);
            user.CustomPermissions = true;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new ApiResponse<bool> { Success = true, Data = true });
        }

        // DELETE: api/admin/users/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteUser(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            
            if (user == null) 
            {
                return NotFound(new ApiResponse<bool> { Success = false, Error = new { message = "User not found" } });
            }

            if (user.Email == "admin@aeon.com")
            {
                 return BadRequest(new ApiResponse<bool> { Success = false, Error = new { message = "Cannot delete the primary admin account." } });
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<bool> { Success = true, Data = true });
        }
    }

    // --- DTOs ---
    public class CreateAdminUserDto
    {
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Role { get; set; } = "viewer";
        public string Notes { get; set; } = string.Empty;
        public string[]? Tags { get; set; }
        public string TemporaryPassword { get; set; } = string.Empty;
        public bool MustChangePassword { get; set; }
    }

    public class UpdateAdminUserDto
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Phone { get; set; }
        public string? Role { get; set; }
        public string? Notes { get; set; }
        public string[]? Tags { get; set; }
    }

    public class UpdateStatusDto
    {
        public string Status { get; set; } = string.Empty;
        public string? Reason { get; set; }
    }

    public class UpdatePermissionsDto
    {
        public Dictionary<string, bool> Permissions { get; set; } = new();
    }
}