# VendasSeguroCelularAPI - .NET 8 Minimal API

## Project Status

- [x] Create .github/copilot-instructions.md
- [x] Scaffold .NET 8 Minimal API project
- [ ] Create Models (DTOs)
- [ ] Create Services (Encryption, Device)
- [ ] Create Data (device database)
- [ ] Configure appsettings.json
- [ ] Add API endpoints to Program.cs
- [ ] Create comprehensive README.md
- [ ] Restore packages and build project

## Project Type
C# .NET 8 Minimal API

## Key Features
- WhatsApp Flow Integration
- RSA-2048 + AES-128-GCM Encryption
- HMAC-SHA256 Webhook Validation
- Swagger/OpenAPI Documentation
- In-memory device database (4 brands, 332 devices)

## Endpoints
1. GET /api/brands
2. GET /api/models?brand={brand}
3. GET /api/memory?model={model}
4. GET /api/device?id={id}
5. POST /api/flow (encrypted)
6. GET/POST /api/webhook
