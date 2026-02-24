using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrgManager.Api.Data;
using OrgManager.Api.Models;

namespace OrgManager.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class MembersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MembersController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/members
        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<Member>>>> GetMembers()
        {
            var members = await _context.Members.ToListAsync();
            return Ok(new ApiResponse<IEnumerable<Member>> { Success = true, Data = members });
        }

        // GET: api/members/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<Member>>> GetMember(Guid id)
        {
            var member = await _context.Members.FindAsync(id);

            if (member == null)
            {
                return NotFound(new ApiResponse<object> { Success = false, Error = new { message = "Member not found" } });
            }

            return Ok(new ApiResponse<Member> { Success = true, Data = member });
        }

        // POST: api/members
        [HttpPost]
        public async Task<ActionResult<ApiResponse<Member>>> CreateMember(Member newMember)
        {
            newMember.Id = Guid.NewGuid();
            newMember.JoinedAt = DateTime.UtcNow;
            newMember.LastSeen = DateTime.UtcNow;

            _context.Members.Add(newMember);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<Member> { Success = true, Data = newMember });
        }

        // PUT: api/members/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<Member>>> UpdateMember(Guid id, Member updatedMember)
        {
            if (id != updatedMember.Id)
            {
                return BadRequest(new ApiResponse<object> { Success = false, Error = new { message = "ID mismatch" } });
            }

            _context.Entry(updatedMember).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MemberExists(id))
                {
                    return NotFound(new ApiResponse<object> { Success = false, Error = new { message = "Member not found" } });
                }
                else
                {
                    throw;
                }
            }

            return Ok(new ApiResponse<Member> { Success = true, Data = updatedMember });
        }

        // DELETE: api/members/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<string>>> DeleteMember(Guid id)
        {
            var member = await _context.Members.FindAsync(id);
            if (member == null)
            {
                return NotFound(new ApiResponse<object> { Success = false, Error = new { message = "Member not found" } });
            }

            _context.Members.Remove(member);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<string> { Success = true, Data = "Member deleted successfully" });
        }

        private bool MemberExists(Guid id)
        {
            return _context.Members.Any(e => e.Id == id);
        }
    }
}