using System.Text.Json.Serialization;

namespace Aeon.BuildingBlocks.Web.Responses;


public sealed class ApiResponse<T>
{

    [JsonPropertyName("success")]
    public bool Success { get; init; }

    [JsonPropertyName("data")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public T? Data { get; init; }

    // Error information (null if request succeeded).
    [JsonPropertyName("error")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public ApiError? Error { get; init; }

    [JsonPropertyName("timestamp")]
    public DateTime Timestamp { get; init; } = DateTime.UtcNow;
}


// Non-generic API response for operations that don't return data.
public sealed class ApiResponse
{
    // Indicates whether the request was successful.
    [JsonPropertyName("success")]
    public bool Success { get; init; }

    // Error information (null if request succeeded).
    [JsonPropertyName("error")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public ApiError? Error { get; init; }

    [JsonPropertyName("timestamp")]
    public DateTime Timestamp { get; init; } = DateTime.UtcNow;

    public static ApiResponse Ok() => new()
    {
        Success = true
    };

    public static ApiResponse Fail(ApiError error) => new()
    {
        Success = false,
        Error = error
    };

    public static ApiResponse Fail(string message, string errorCode = "ERROR") => new()
    {
        Success = false,
        Error = new ApiError(message, errorCode)
    };
}

// Factory class for creating generic API responses.
// Avoids CA1000 (static members on generic types).

public static class ApiResponseFactory
{
    public static ApiResponse<T> Ok<T>(T data) => new()
    {
        Success = true,
        Data = data
    };

    public static ApiResponse<T> Fail<T>(ApiError error) => new()
    {
        Success = false,
        Error = error
    };

    public static ApiResponse<T> Fail<T>(string message, string errorCode = "ERROR") => new()
    {
        Success = false,
        Error = new ApiError(message, errorCode)
    };
}