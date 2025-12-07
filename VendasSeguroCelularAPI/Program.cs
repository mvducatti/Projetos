using System.Text.Json;
using VendasSeguroCelularAPI.Models;
using VendasSeguroCelularAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Vendas Seguro Celular API",
        Version = "v1",
        Description = "API para integração com WhatsApp Flow - Sistema de Vendas de Seguro para Celulares"
    });
});

// Add CORS
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("WhatsAppPolicy", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Register services
builder.Services.AddSingleton<EncryptionService>();
builder.Services.AddSingleton<DeviceService>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("WhatsAppPolicy");

// ==================== ENDPOINTS ====================

// GET /api/brands - Returns list of phone brands
app.MapGet("/api/brands", (DeviceService deviceService) =>
{
    try
    {
        var brands = deviceService.GetBrands();
        return Results.Ok(new BrandResponse { HasError = false, Data = brands });
    }
    catch (Exception ex)
    {
        return Results.Json(
            new BrandResponse { HasError = true, Data = new List<Brand>() },
            statusCode: 500
        );
    }
})
.WithName("GetBrands")
.WithTags("Devices")
.WithOpenApi();

// GET /api/models?brand={brand} - Returns phone models filtered by brand
app.MapGet("/api/models", (string brand, DeviceService deviceService) =>
{
    try
    {
        if (string.IsNullOrWhiteSpace(brand))
        {
            return Results.BadRequest(new DeviceListResponse
            {
                HasError = true,
                Data = new List<Device>()
            });
        }

        var models = deviceService.GetModels(brand);
        return Results.Ok(new DeviceListResponse { HasError = false, Data = models });
    }
    catch (Exception ex)
    {
        return Results.Json(
            new DeviceListResponse { HasError = true, Data = new List<Device>() },
            statusCode: 500
        );
    }
})
.WithName("GetModels")
.WithTags("Devices")
.WithOpenApi();

// GET /api/memory?model={model} - Returns memory options for a specific model
app.MapGet("/api/memory", (string model, DeviceService deviceService) =>
{
    try
    {
        if (string.IsNullOrWhiteSpace(model))
        {
            return Results.BadRequest(new DeviceListResponse
            {
                HasError = true,
                Data = new List<Device>()
            });
        }

        var memoryOptions = deviceService.GetMemoryOptions(model);
        return Results.Ok(new DeviceListResponse { HasError = false, Data = memoryOptions });
    }
    catch (Exception ex)
    {
        return Results.Json(
            new DeviceListResponse { HasError = true, Data = new List<Device>() },
            statusCode: 500
        );
    }
})
.WithName("GetMemoryOptions")
.WithTags("Devices")
.WithOpenApi();

// GET /api/device?id={id} - Returns device details with price by ID
app.MapGet("/api/device", (int id, DeviceService deviceService) =>
{
    try
    {
        var device = deviceService.GetDeviceById(id);
        
        if (device == null)
        {
            return Results.NotFound(new DeviceResponse { HasError = true, Data = null });
        }

        return Results.Ok(new DeviceResponse { HasError = false, Data = device });
    }
    catch (Exception ex)
    {
        return Results.Json(
            new DeviceResponse { HasError = true, Data = null },
            statusCode: 500
        );
    }
})
.WithName("GetDevice")
.WithTags("Devices")
.WithOpenApi();

// POST /api/flow - Main WhatsApp Flow endpoint (encrypted data exchange)
app.MapPost("/api/flow", async (
    HttpContext context,
    EncryptionService encryptionService,
    DeviceService deviceService) =>
{
    try
    {
        var requestBody = await JsonSerializer.DeserializeAsync<FlowRequest>(context.Request.Body);
        
        if (requestBody == null || 
            string.IsNullOrEmpty(requestBody.EncryptedFlowData) ||
            string.IsNullOrEmpty(requestBody.EncryptedAesKey) ||
            string.IsNullOrEmpty(requestBody.InitialVector))
        {
            return Results.BadRequest(new { error = "Invalid request", message = "Missing encrypted fields" });
        }

        // Decrypt request
        var decryptedRequest = encryptionService.DecryptRequest(
            requestBody.EncryptedFlowData,
            requestBody.EncryptedAesKey,
            requestBody.InitialVector
        );

        // Decrypt AES key for response encryption
        byte[] decryptedAesKey = Convert.FromBase64String(requestBody.EncryptedAesKey);
        // NOTE: Full implementation requires RSA decryption of AES key
        // This is a simplified version - see EncryptionService for complete implementation

        // Handle different actions
        object response = decryptedRequest.Action switch
        {
            "ping" => new FlowDataResponse { Data = new Dictionary<string, object> { ["status"] = "active" } },
            "INIT" => HandleInitAction(deviceService),
            "data_exchange" => HandleDataExchange(decryptedRequest, deviceService),
            _ => new { error = "Unknown action" }
        };

        // Encrypt response
        // NOTE: This requires the decrypted AES key from the request
        // For production use, implement full encryption in EncryptionService
        var encryptedResponse = encryptionService.EncryptResponse(
            response,
            decryptedAesKey,
            requestBody.InitialVector
        );

        return Results.Text(encryptedResponse, "application/octet-stream");
    }
    catch (Exception ex)
    {
        // If decryption fails, return 421 to refresh keys
        if (ex.Message.Contains("Decryption failed"))
        {
            return Results.StatusCode(421);
        }

        return Results.Json(new { error = "Internal server error", message = ex.Message }, statusCode: 500);
    }
})
.WithName("FlowEndpoint")
.WithTags("Flow")
.WithOpenApi();

// GET /api/webhook - Webhook verification
app.MapGet("/api/webhook", (
    HttpContext context,
    IConfiguration configuration) =>
{
    var mode = context.Request.Query["hub.mode"].ToString();
    var token = context.Request.Query["hub.verify_token"].ToString();
    var challenge = context.Request.Query["hub.challenge"].ToString();

    var verifyToken = configuration["WhatsApp:WebhookVerifyToken"];

    if (mode == "subscribe" && token == verifyToken)
    {
        return Results.Text(challenge, "text/plain");
    }

    return Results.StatusCode(403);
})
.WithName("WebhookVerification")
.WithTags("Webhook")
.WithOpenApi();

// POST /api/webhook - Webhook notifications
app.MapPost("/api/webhook", async (
    HttpContext context,
    EncryptionService encryptionService,
    IConfiguration configuration) =>
{
    try
    {
        // Read body as string for signature validation
        using var reader = new StreamReader(context.Request.Body);
        var body = await reader.ReadToEndAsync();

        // Validate signature
        var signature = context.Request.Headers["x-hub-signature-256"].ToString();
        var appSecret = configuration["WhatsApp:AppSecret"] ?? "";

        if (!encryptionService.ValidateSignature(body, signature, appSecret))
        {
            return Results.StatusCode(401);
        }

        // Parse webhook data
        var webhookData = JsonSerializer.Deserialize<WebhookRequest>(body);

        // Process messages
        if (webhookData?.Entry != null)
        {
            foreach (var entry in webhookData.Entry)
            {
                if (entry.Changes != null)
                {
                    foreach (var change in entry.Changes)
                    {
                        var messages = change.Value?.Messages;
                        if (messages != null)
                        {
                            foreach (var message in messages)
                            {
                                // Check for keywords to trigger Flow
                                var messageText = message.Text?.Body?.ToLower() ?? "";
                                if (messageText.Contains("quero proteger") ||
                                    messageText.Contains("cotação") ||
                                    messageText.Contains("seguro"))
                                {
                                    // TODO: Send Flow template
                                    // This requires WhatsApp Cloud API integration
                                    Console.WriteLine($"Trigger Flow for message from: {message.From}");
                                }
                            }
                        }
                    }
                }
            }
        }

        return Results.Ok(new { status = "received" });
    }
    catch (Exception ex)
    {
        return Results.Json(new { error = "Internal server error", message = ex.Message }, statusCode: 500);
    }
})
.WithName("WebhookNotifications")
.WithTags("Webhook")
.WithOpenApi();

app.Run();

// Helper methods
static FlowResponse HandleInitAction(DeviceService deviceService)
{
    var brands = deviceService.GetBrands();
    return new FlowResponse
    {
        Screen = "DEVICE_SELECTION",
        Data = new Dictionary<string, object>
        {
            ["brands"] = brands.Select(b => new { id = b.Id, title = b.Name }).ToList(),
            ["models"] = new List<object>(),
            ["memories"] = new List<object>(),
            ["selected_brand"] = "",
            ["selected_model"] = "",
            ["selected_memory"] = "",
            ["device_id"] = ""
        }
    };
}

static object HandleDataExchange(DecryptedFlowRequest request, DeviceService deviceService)
{
    // Handle different screens
    if (request.Screen == "DEVICE_SELECTION")
    {
        var brands = deviceService.GetBrands();
        var data = request.Data ?? new Dictionary<string, object>();
        
        var selectedBrand = data.ContainsKey("selected_brand") ? data["selected_brand"].ToString() : "";
        var selectedModel = data.ContainsKey("selected_model") ? data["selected_model"].ToString() : "";
        
        var models = new List<object>();
        var memories = new List<object>();
        
        if (!string.IsNullOrEmpty(selectedBrand))
        {
            var deviceModels = deviceService.GetModels(selectedBrand);
            models = deviceModels.Select(m => new { id = m.DeModel, title = m.DeModel }).ToList<object>();
        }
        
        if (!string.IsNullOrEmpty(selectedModel))
        {
            var memoryOptions = deviceService.GetMemoryOptions(selectedModel);
            memories = memoryOptions.Select(m => new { id = m.IdObjectSmartphone.ToString(), title = m.DeMemory }).ToList<object>();
        }
        
        return new FlowResponse
        {
            Screen = "DEVICE_SELECTION",
            Data = new Dictionary<string, object>
            {
                ["brands"] = brands.Select(b => new { id = b.Id, title = b.Name }).ToList(),
                ["models"] = models,
                ["memories"] = memories,
                ["selected_brand"] = selectedBrand ?? "",
                ["selected_model"] = selectedModel ?? "",
                ["selected_memory"] = data.ContainsKey("selected_memory") ? data["selected_memory"].ToString() ?? "" : "",
                ["device_id"] = data.ContainsKey("device_id") ? data["device_id"].ToString() ?? "" : ""
            }
        };
    }
    
    return new { error = "Unhandled screen" };
}
