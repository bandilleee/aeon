using System.Text.Json.Serialization;

namespace Aeon.BuildingBlocks.Web.Responses;

public sealed class ApiError
{
    [JsonPropertyName("message")]
    public string Message { get; init; }


    [JsonPropertyName("code")]
    public string Code { get; init; }

    [JsonPropertyName("details")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public IReadOnlyDictionary<string, string[]>? Details { get; init; }

    public ApiError(string message, string code, IReadOnlyDictionary<string, string[]>? details = null)
    {
        Message = message;
        Code = code;
        Details = details;
    }
}