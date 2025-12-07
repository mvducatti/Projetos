using System.Text.Json.Serialization;

namespace VendasSeguroCelularAPI.Models;

public class FlowRequest
{
    [JsonPropertyName("encrypted_flow_data")]
    public string EncryptedFlowData { get; set; } = string.Empty;

    [JsonPropertyName("encrypted_aes_key")]
    public string EncryptedAesKey { get; set; } = string.Empty;

    [JsonPropertyName("initial_vector")]
    public string InitialVector { get; set; } = string.Empty;
}

public class DecryptedFlowRequest
{
    [JsonPropertyName("version")]
    public string Version { get; set; } = string.Empty;

    [JsonPropertyName("action")]
    public string Action { get; set; } = string.Empty;

    [JsonPropertyName("screen")]
    public string Screen { get; set; } = string.Empty;

    [JsonPropertyName("data")]
    public Dictionary<string, object>? Data { get; set; }

    [JsonPropertyName("flow_token")]
    public string FlowToken { get; set; } = string.Empty;
}

public class FlowResponse
{
    [JsonPropertyName("screen")]
    public string Screen { get; set; } = string.Empty;

    [JsonPropertyName("data")]
    public Dictionary<string, object> Data { get; set; } = new();
}

public class FlowDataResponse
{
    [JsonPropertyName("data")]
    public Dictionary<string, object> Data { get; set; } = new();
}
