using MediatR;
using Microsoft.Extensions.Logging;
using System.Diagnostics;

namespace Aeon.BuildingBlocks.CQRS.Behaviors;


public sealed partial class LoggingBehavior<TRequest, TResponse>: IPipelineBehavior<TRequest, TResponse>
    where TRequest: notnull
{
    private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;

    public LoggingBehavior(ILogger<LoggingBehavior<TRequest, TResponse>> logger)
    {
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;

        LogHandlingRequest(_logger, requestName);

        var stopwatch = Stopwatch.StartNew();

        try
        {
            var response = await next(cancellationToken).ConfigureAwait(false);

            stopwatch.Stop();

            LogHandledRequest(_logger, requestName, stopwatch.ElapsedMilliseconds);

            return response;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();

            LogRequestError(_logger, ex, requestName, stopwatch.ElapsedMilliseconds);

            throw;
        }
    }

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Handling {RequestName}")]
    private static partial void LogHandlingRequest(ILogger logger, string requestName);

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "Handled {RequestName} in {ElapsedMilliseconds}ms")]
    private static partial void LogHandledRequest(ILogger logger, string requestName, long elapsedMilliseconds);

    [LoggerMessage(
        Level = LogLevel.Error,
        Message = "Error handling {RequestName} after {ElapsedMilliseconds}ms")]
    private static partial void LogRequestError(ILogger logger, Exception ex, string requestName, long elapsedMilliseconds);
}