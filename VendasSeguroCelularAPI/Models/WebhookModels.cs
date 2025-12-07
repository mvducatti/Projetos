using System.Text.Json.Serialization;

namespace VendasSeguroCelularAPI.Models;

public class WebhookMessage
{
    [JsonPropertyName("from")]
    public string From { get; set; } = string.Empty;

    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("timestamp")]
    public string Timestamp { get; set; } = string.Empty;

    [JsonPropertyName("type")]
    public string Type { get; set; } = string.Empty;

    [JsonPropertyName("text")]
    public WebhookText? Text { get; set; }
}

public class WebhookText
{
    [JsonPropertyName("body")]
    public string Body { get; set; } = string.Empty;
}

public class WebhookValue
{
    [JsonPropertyName("messaging_product")]
    public string MessagingProduct { get; set; } = string.Empty;

    [JsonPropertyName("metadata")]
    public WebhookMetadata? Metadata { get; set; }

    [JsonPropertyName("messages")]
    public List<WebhookMessage>? Messages { get; set; }
}

public class WebhookMetadata
{
    [JsonPropertyName("display_phone_number")]
    public string DisplayPhoneNumber { get; set; } = string.Empty;

    [JsonPropertyName("phone_number_id")]
    public string PhoneNumberId { get; set; } = string.Empty;
}

public class WebhookChange
{
    [JsonPropertyName("value")]
    public WebhookValue? Value { get; set; }

    [JsonPropertyName("field")]
    public string Field { get; set; } = string.Empty;
}

public class WebhookEntry
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("changes")]
    public List<WebhookChange>? Changes { get; set; }
}

public class WebhookRequest
{
    [JsonPropertyName("object")]
    public string Object { get; set; } = string.Empty;

    [JsonPropertyName("entry")]
    public List<WebhookEntry>? Entry { get; set; }
}
