using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aeon.Identity.Api.Controllers;

// Health check controller. 
[ApiController]
[Route("[controller]")]
[AllowAnonymous]
public sealed class HealthController : ControllerBase
{
    // Basic health check endpoint.
    [HttpGet]
    [ProducesResponseType(typeof(HealthResponse), StatusCodes.Status200OK)]
    public IActionResult Get()
    {
        return Ok(new HealthResponse
        {
            Status = "Healthy",
            Timestamp = DateTime.UtcNow,
            Service = "Aeon.Identity.Api",
            Version = "1.0.0"
        });
    }
}

// Health check response model.
public sealed class HealthResponse
{
    public string Status { get; init; } = string.Empty;
    public DateTime Timestamp { get; init; }
    public string Service { get; init; } = string.Empty;
    public string Version { get; init; } = string.Empty;
}