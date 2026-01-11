using Aeon.Identity.Application.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Aeon.Identity.Infrastructure.Services;

public sealed partial class RecaptchaService : IRecaptchaService
{
    private readonly RecaptchaSettings _settings;
    private readonly HttpClient _httpClient;
    private readonly ILogger<RecaptchaService> _logger;

    public RecaptchaService(
        IOptions<RecaptchaSettings> settings,
        HttpClient httpClient,
        ILogger<RecaptchaService> logger)
    {
        _settings = settings.Value;
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<bool> ValidateAsync(
        string token,
        string expectedAction,
        CancellationToken cancellationToken = default)
    {
        if (!_settings.Enabled)
        {
            LogRecaptchaDisabled(_logger);
            return true;
        }

        if (string.IsNullOrWhiteSpace(token))
        {
            LogMissingToken(_logger);
            return false;
        }

        try
        {
            var parameters = new Dictionary<string, string>
            {
                { "secret", _settings.SecretKey },
                { "response", token }
            };

            using var content = new FormUrlEncodedContent(parameters);
            using var response = await _httpClient.PostAsync(
                _settings.VerifyUrl,
                content,
                cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                LogApiError(_logger, (int)response.StatusCode);
                return false;
            }

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            var result = JsonSerializer.Deserialize<RecaptchaResponse>(json);

            if (result is null)
            {
                LogInvalidResponse(_logger);
                return false;
            }

            if (!result.Success)
            {
                LogVerificationFailed(_logger, result.ErrorCodes);
                return false;
            }

            if (!string.IsNullOrEmpty(expectedAction) &&
                !string.Equals(result.Action, expectedAction, StringComparison.OrdinalIgnoreCase))
            {
                LogActionMismatch(_logger, expectedAction, result.Action);
                return false;
            }

            if (result.Score < _settings.MinimumScore)
            {
                LogLowScore(_logger, result.Score, _settings.MinimumScore);
                return false;
            }

            LogSuccess(_logger, result.Score);
            return true;
        }
        catch (Exception ex)
        {
            LogException(_logger, ex);
            return false;
        }
    }

    private sealed class RecaptchaResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; init; }

        [JsonPropertyName("score")]
        public double Score { get; init; }

        [JsonPropertyName("action")]
        public string? Action { get; init; }

        [JsonPropertyName("challenge_ts")]
        public string? ChallengeTimestamp { get; init; }

        [JsonPropertyName("hostname")]
        public string? Hostname { get; init; }

        [JsonPropertyName("error-codes")]
        public string[]? ErrorCodes { get; init; }
    }

    [LoggerMessage(Level = LogLevel.Debug, Message = "reCAPTCHA validation disabled, skipping")]
    private static partial void LogRecaptchaDisabled(ILogger logger);

    [LoggerMessage(Level = LogLevel.Warning, Message = "reCAPTCHA token is missing")]
    private static partial void LogMissingToken(ILogger logger);

    [LoggerMessage(Level = LogLevel.Error, Message = "reCAPTCHA API returned status code {StatusCode}")]
    private static partial void LogApiError(ILogger logger, int statusCode);

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to parse reCAPTCHA response")]
    private static partial void LogInvalidResponse(ILogger logger);

    [LoggerMessage(Level = LogLevel.Warning, Message = "reCAPTCHA verification failed: {ErrorCodes}")]
    private static partial void LogVerificationFailed(ILogger logger, string[]? errorCodes);

    [LoggerMessage(Level = LogLevel.Warning, Message = "reCAPTCHA action mismatch: expected {Expected}, got {Actual}")]
    private static partial void LogActionMismatch(ILogger logger, string expected, string? actual);

    [LoggerMessage(Level = LogLevel.Warning, Message = "reCAPTCHA score {Score} below threshold {Threshold}")]
    private static partial void LogLowScore(ILogger logger, double score, double threshold);

    [LoggerMessage(Level = LogLevel.Debug, Message = "reCAPTCHA validation successful with score {Score}")]
    private static partial void LogSuccess(ILogger logger, double score);

    [LoggerMessage(Level = LogLevel.Error, Message = "reCAPTCHA validation error")]
    private static partial void LogException(ILogger logger, Exception exception);
}