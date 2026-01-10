using Aeon.BuildingBlocks.Web.Responses;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;

namespace Aeon.BuildingBlocks.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public abstract class BaseApiController: ControllerBase
{
    private IMediator? _mediator;

    // Gets the MediatR mediator instance.

    protected IMediator Mediator =>
        _mediator ??= HttpContext.RequestServices.GetRequiredService<IMediator>();


    protected IActionResult OkResponse<T>(T data)
    {
        return Ok(ApiResponseFactory.Ok(data));
    }

    // Returns a successful response with no data.
    protected IActionResult OkResponse()
    {
        return Ok(ApiResponse.Ok());
    }

    protected IActionResult CreatedResponse<T>(string routeName, object routeValues, T data)
    {
        return CreatedAtRoute(routeName, routeValues, ApiResponseFactory.Ok(data));
    }

    protected IActionResult BadRequestResponse(string message, string errorCode = "BAD_REQUEST")
    {
        return BadRequest(ApiResponse.Fail(message, errorCode));
    }

    protected IActionResult ValidationErrorResponse(IReadOnlyDictionary<string, string[]> errors)
    {
        var apiError = new ApiError(
            "One or more validation errors occurred.",
            "VALIDATION_ERROR",
            errors);

        return BadRequest(ApiResponse.Fail(apiError));
    }

    protected IActionResult UnauthorizedResponse(
        string message = "Authentication is required.",
        string errorCode = "UNAUTHORIZED")
    {
        return Unauthorized(ApiResponse.Fail(message, errorCode));
    }

    protected IActionResult ForbiddenResponse(
        string message = "You do not have permission to perform this action.",
        string errorCode = "FORBIDDEN")
    {
        return StatusCode(403, ApiResponse.Fail(message, errorCode));
    }


    protected IActionResult NotFoundResponse(
        string message = "The requested resource was not found.",
        string errorCode = "NOT_FOUND")
    {
        return NotFound(ApiResponse.Fail(message, errorCode));
    }

    protected IActionResult ConflictResponse(
        string message = "The request conflicts with the current state.",
        string errorCode = "CONFLICT")
    {
        return Conflict(ApiResponse.Fail(message, errorCode));
    }
}