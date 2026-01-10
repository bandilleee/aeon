using Aeon.BuildingBlocks.Web.Responses;
using Aeon.Common.Kernel.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace Aeon.BuildingBlocks.Web.Middleware;

// Middleware that catches exceptions and returns consistent API error responses.
public sealed partial class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex).ConfigureAwait(false);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, response) = exception switch
        {
            ValidationException validationEx => (
                StatusCodes.Status400BadRequest,
                ApiResponse.Fail(new ApiError(
                    validationEx.Message,
                    validationEx.ErrorCode,
                    validationEx.Errors))),

            NotFoundException notFoundEx => (
                StatusCodes.Status404NotFound,
                ApiResponse.Fail(notFoundEx.Message, notFoundEx.ErrorCode)),

            UnauthorizedException unauthorizedEx => (
                StatusCodes.Status401Unauthorized,
                ApiResponse.Fail(unauthorizedEx.Message, unauthorizedEx.ErrorCode)),

            ForbiddenException forbiddenEx => (
                StatusCodes.Status403Forbidden,
                ApiResponse.Fail(forbiddenEx.Message, forbiddenEx.ErrorCode)),

            ConflictException conflictEx => (
                StatusCodes.Status409Conflict,
                ApiResponse.Fail(conflictEx.Message, conflictEx.ErrorCode)),

            DomainException domainEx => (
                StatusCodes.Status400BadRequest,
                ApiResponse.Fail(domainEx.Message, domainEx.ErrorCode)),

            _ => (
                StatusCodes.Status500InternalServerError,
                ApiResponse.Fail("An unexpected error occurred.", "INTERNAL_ERROR"))
        };

        // Log the exception
        if (statusCode == StatusCodes.Status500InternalServerError)
        {
            LogUnhandledException(_logger, exception);
        }
        else
        {
            LogDomainException(_logger, exception, exception.GetType().Name);
        }

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        var json = JsonSerializer.Serialize(response, JsonOptions);
        await context.Response.WriteAsync(json).ConfigureAwait(false);
    }

    [LoggerMessage(
        Level = LogLevel.Error,
        Message = "Unhandled exception occurred")]
    private static partial void LogUnhandledException(ILogger logger, Exception exception);

    [LoggerMessage(
        Level = LogLevel.Warning,
        Message = "Domain exception occurred:  {ExceptionType}")]
    private static partial void LogDomainException(ILogger logger, Exception exception, string exceptionType);
}