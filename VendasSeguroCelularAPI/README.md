# 📱 Vendas Seguro Celular API - .NET 8 Minimal API

> **Sistema de vendas de seguro para celulares via WhatsApp Flow**  
> **Versão:** 1.0  
> **Framework:** .NET 8  
> **Data:** Dezembro 2025

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Pré-requisitos](#pré-requisitos)
4. [Configuração](#configuração)
5. [Endpoints da API](#endpoints-da-api)
6. [Modelos de Dados](#modelos-de-dados)
7. [Criptografia](#criptografia)
8. [Banco de Dados](#banco-de-dados)
9. [Como Executar](#como-executar)
10. [Deploy](#deploy)
11. [Testes](#testes)

---

## 🎯 Visão Geral

API em .NET 8 Minimal API para integração com WhatsApp Flow, permitindo vendas de seguro para celulares através de conversas automatizadas no WhatsApp.

### Funcionalidades

- ✅ 4 marcas suportadas (Apple, Samsung, Motorola, Xiaomi)
- ✅ 30+ modelos únicos de dispositivos
- ✅ Criptografia RSA-2048 + AES-128-GCM
- ✅ Validação HMAC-SHA256 de webhooks
- ✅ Swagger/OpenAPI documentation
- ✅ CORS configurado para WhatsApp
- ✅ Banco de dados em memória (demo)

### Tecnologias

- .NET 8.0
- ASP.NET Core Minimal APIs
- System.Security.Cryptography (RSA + AES-GCM)
- Swagger/OpenAPI
- WhatsApp Cloud API v21.0

---

## 🏗️ Arquitetura

```
VendasSeguroCelularAPI/
│
├── Models/                      # DTOs e modelos de dados
│   ├── Brand.cs                # Marca de dispositivo
│   ├── Device.cs               # Dispositivo com preço
│   ├── FlowModels.cs           # Requisição/resposta do Flow
│   └── WebhookModels.cs        # Webhook do WhatsApp
│
├── Services/                    # Lógica de negócio
│   ├── EncryptionService.cs    # RSA + AES-GCM encryption
│   └── DeviceService.cs        # Consulta de dispositivos
│
├── Data/                        # Banco de dados
│   └── DeviceDatabase.cs       # In-memory database (30 devices)
│
├── Program.cs                   # Endpoints da Minimal API
├── appsettings.json            # Configurações (chaves, tokens)
└── README.md                   # Esta documentação

```

### Fluxo de Dados

```
WhatsApp User → WhatsApp Cloud API → POST /api/webhook → 
Detecta keyword → Envia Flow Template → 
User interage com Flow → POST /api/flow (encrypted) → 
Decrypta → Processa → Encripta → Retorna ao WhatsApp
```

---

## ⚙️ Pré-requisitos

### Desenvolvimento

- ✅ .NET 8 SDK ou superior
- ✅ Visual Studio 2022 / VS Code / Rider
- ✅ Conta WhatsApp Business
- ✅ WhatsApp Flow configurado
- ✅ Par de chaves RSA-2048 (privada/pública)

### Instalação do .NET 8

```bash
# Windows
winget install Microsoft.DotNet.SDK.8

# macOS
brew install dotnet@8

# Linux (Ubuntu)
wget https://dot.net/v1/dotnet-install.sh
chmod +x dotnet-install.sh
./dotnet-install.sh --channel 8.0
```

---

## 🔧 Configuração

### 1. Clone o Repositório

```bash
git clone https://github.com/mvducatti/Projetos.git
cd Projetos/VendasSeguroCelularAPI
```

### 2. Configure appsettings.json

Edite `appsettings.json` com suas credenciais:

```json
{
  "WhatsApp": {
    "PhoneNumberId": "SEU_PHONE_NUMBER_ID",
    "AccessToken": "SEU_ACCESS_TOKEN",
    "AppSecret": "SEU_APP_SECRET",
    "WebhookVerifyToken": "SEU_VERIFY_TOKEN",
    "FlowId": "SEU_FLOW_ID",
    "PrivateKey": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
  }
}
```

**⚠️ IMPORTANTE:**
- Nunca commite `appsettings.json` com dados reais!
- Use `appsettings.Development.json` para dev local
- Use variáveis de ambiente em produção

### 3. Obter Credenciais WhatsApp

1. **Phone Number ID:** Meta Business Suite → WhatsApp → API Setup
2. **Access Token:** Generate permanent token no dashboard
3. **App Secret:** App Dashboard → Settings → Basic
4. **Flow ID:** WhatsApp Manager → Flows → Seu Flow → ID
5. **Chave Privada:** Deve corresponder à chave pública do Flow

### 4. Gerar Par de Chaves RSA (se necessário)

```bash
# Gerar chave privada
openssl genpkey -algorithm RSA -out private-key.pem -pkeyopt rsa_keygen_bits:2048

# Extrair chave pública
openssl rsa -pubout -in private-key.pem -out public-key.pem
```

Cole a chave privada completa (incluindo BEGIN/END) no `appsettings.json`.

---

## 🔌 Endpoints da API

### 1. GET /api/brands

Retorna lista de marcas disponíveis.

**Request:**
```http
GET /api/brands
```

**Response:** `200 OK`
```json
{
  "hasError": false,
  "data": [
    { "id": "APPLE", "name": "Apple" },
    { "id": "SAMSUNG", "name": "Samsung" },
    { "id": "MOTOROLA", "name": "Motorola" },
    { "id": "XIAOMI", "name": "Xiaomi" }
  ]
}
```

**Tags:** `Devices`

---

### 2. GET /api/models

Retorna modelos filtrados por marca (sem duplicatas).

**Request:**
```http
GET /api/models?brand=APPLE
```

**Parâmetros:**
- `brand` (required): `APPLE`, `SAMSUNG`, `MOTOROLA` ou `XIAOMI`

**Response:** `200 OK`
```json
{
  "hasError": false,
  "data": [
    {
      "idObjectSmartphone": 123,
      "deModel": "IPHONE 15 PRO MAX",
      "deMemory": "256 GB",
      "price": 7599.00,
      "formattedPrice": ""
    },
    {
      "idObjectSmartphone": 126,
      "deModel": "IPHONE 15 PRO",
      "deMemory": "256 GB",
      "price": 6599.00,
      "formattedPrice": ""
    }
  ]
}
```

**Tags:** `Devices`

---

### 3. GET /api/memory

Retorna opções de memória para modelo específico.

**Request:**
```http
GET /api/memory?model=IPHONE%2015%20PRO%20MAX
```

**Parâmetros:**
- `model` (required): Nome do modelo (URL encoded)

**Response:** `200 OK`
```json
{
  "hasError": false,
  "data": [
    {
      "idObjectSmartphone": 123,
      "deModel": "IPHONE 15 PRO MAX",
      "deMemory": "256 GB",
      "price": 7599.00,
      "formattedPrice": ""
    },
    {
      "idObjectSmartphone": 124,
      "deModel": "IPHONE 15 PRO MAX",
      "deMemory": "512 GB",
      "price": 8799.00,
      "formattedPrice": ""
    },
    {
      "idObjectSmartphone": 125,
      "deModel": "IPHONE 15 PRO MAX",
      "deMemory": "1 TB",
      "price": 10199.00,
      "formattedPrice": ""
    }
  ]
}
```

**Tags:** `Devices`

---

### 4. GET /api/device

Retorna detalhes do dispositivo com preço formatado.

**Request:**
```http
GET /api/device?id=123
```

**Parâmetros:**
- `id` (required): `IdObjectSmartphone`

**Response:** `200 OK`
```json
{
  "hasError": false,
  "data": {
    "idObjectSmartphone": 123,
    "deModel": "IPHONE 15 PRO MAX",
    "deMemory": "256 GB",
    "price": 7599.00,
    "formattedPrice": "R$ 7.599,00"
  }
}
```

**Response:** `404 Not Found`
```json
{
  "hasError": true,
  "data": null
}
```

**Tags:** `Devices`

---

### 5. POST /api/flow

Endpoint principal do WhatsApp Flow (dados encriptados).

**Request:**
```http
POST /api/flow
Content-Type: application/json

{
  "encrypted_flow_data": "base64_encrypted_data",
  "encrypted_aes_key": "base64_encrypted_aes_key",
  "initial_vector": "base64_iv"
}
```

**Request Body (Decrypted):**
```json
{
  "version": "3.0",
  "action": "INIT" | "data_exchange" | "ping" | "complete",
  "screen": "DEVICE_SELECTION",
  "data": { ... },
  "flow_token": "unique_token"
}
```

**Response:** `200 OK`
```
base64_encrypted_response
```

**Response (Decrypted for INIT):**
```json
{
  "screen": "DEVICE_SELECTION",
  "data": {
    "brands": [
      { "id": "APPLE", "title": "Apple" }
    ],
    "models": [],
    "memories": [],
    "selected_brand": "",
    "selected_model": "",
    "selected_memory": "",
    "device_id": ""
  }
}
```

**Actions:**
- `ping` - Health check
- `INIT` - Carrega primeira tela com marcas
- `data_exchange` - Interações (dropdowns, navegação)
- `complete` - Finalização do pedido

**Error Response:** `421 Locked`  
Significa que a chave RSA é inválida. WhatsApp vai requisitar nova chave pública.

**Tags:** `Flow`

---

### 6. GET /api/webhook

Verificação do webhook pelo WhatsApp.

**Request:**
```http
GET /api/webhook?hub.mode=subscribe&hub.verify_token=SEU_TOKEN&hub.challenge=12345
```

**Parâmetros:**
- `hub.mode`: `subscribe`
- `hub.verify_token`: Token configurado no `appsettings.json`
- `hub.challenge`: String aleatória do WhatsApp

**Response:** `200 OK`
```
12345
```

**Response:** `403 Forbidden` (token inválido)

**Tags:** `Webhook`

---

### 7. POST /api/webhook

Recebe notificações de mensagens do WhatsApp.

**Request:**
```http
POST /api/webhook
Content-Type: application/json
x-hub-signature-256: sha256=...

{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "...",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "messages": [
              {
                "from": "5511999999999",
                "type": "text",
                "text": { "body": "quero proteger meu celular" }
              }
            ]
          }
        }
      ]
    }
  ]
}
```

**Headers:**
- `x-hub-signature-256`: Assinatura HMAC-SHA256 do body

**Response:** `200 OK`
```json
{
  "status": "received"
}
```

**Response:** `401 Unauthorized` (assinatura inválida)

**Keywords detectadas:**
- "quero proteger"
- "cotação"
- "seguro"

Quando detectadas, a API deve enviar um template com o Flow ID (implementação pendente).

**Tags:** `Webhook`

---

## 📦 Modelos de Dados

### Brand

```csharp
public class Brand
{
    public string Id { get; set; }        // "APPLE", "SAMSUNG", etc.
    public string Name { get; set; }      // "Apple", "Samsung", etc.
}
```

### Device

```csharp
public class Device
{
    public int IdObjectSmartphone { get; set; }   // ID único
    public string DeModel { get; set; }           // "IPHONE 15 PRO MAX"
    public string DeMemory { get; set; }          // "256 GB"
    public decimal Price { get; set; }            // 7599.00
    public string FormattedPrice { get; set; }    // "R$ 7.599,00"
}
```

### FlowRequest

```csharp
public class FlowRequest
{
    public string EncryptedFlowData { get; set; }
    public string EncryptedAesKey { get; set; }
    public string InitialVector { get; set; }
}
```

### DecryptedFlowRequest

```csharp
public class DecryptedFlowRequest
{
    public string Version { get; set; }           // "3.0"
    public string Action { get; set; }            // "INIT", "data_exchange", etc.
    public string Screen { get; set; }            // "DEVICE_SELECTION", etc.
    public Dictionary<string, object>? Data { get; set; }
    public string FlowToken { get; set; }
}
```

---

## 🔐 Criptografia

### RSA-2048 + AES-128-GCM

A API usa criptografia de ponta a ponta com WhatsApp:

#### Decriptografia (Request)

1. **Decripta chave AES** com RSA private key (OAEP-SHA256)
2. **Decripta dados do Flow** com AES-128-GCM usando chave decriptada
3. **Desserializa JSON** para `DecryptedFlowRequest`

```csharp
// EncryptionService.cs
public DecryptedFlowRequest DecryptRequest(
    string encryptedFlowData, 
    string encryptedAesKey, 
    string initialVector)
{
    // 1. Decrypt AES key with RSA
    byte[] decryptedAesKey = DecryptAesKey(encryptedAesKey);
    
    // 2. Decrypt flow data with AES-GCM
    string decryptedJson = DecryptFlowData(encryptedFlowData, decryptedAesKey, initialVector);
    
    // 3. Deserialize JSON
    return JsonSerializer.Deserialize<DecryptedFlowRequest>(decryptedJson);
}
```

#### Encriptação (Response)

1. **Serializa objeto** para JSON
2. **Inverte IV** (flip bits)
3. **Encripta com AES-GCM** usando chave recebida e IV invertido
4. **Concatena ciphertext + tag** (16 bytes)
5. **Converte para Base64**

```csharp
// EncryptionService.cs
public string EncryptResponse(
    object response, 
    byte[] aesKey, 
    string initialVector)
{
    // 1. Serialize to JSON
    string json = JsonSerializer.Serialize(response);
    
    // 2. Flip IV bits
    byte[] ivBuffer = Convert.FromBase64String(initialVector);
    byte[] flippedIv = new byte[ivBuffer.Length];
    for (int i = 0; i < ivBuffer.Length; i++)
    {
        flippedIv[i] = (byte)~ivBuffer[i];
    }
    
    // 3. Encrypt with AES-GCM
    using var aesGcm = new AesGcm(aesKey, 16);
    byte[] plaintext = Encoding.UTF8.GetBytes(json);
    byte[] ciphertext = new byte[plaintext.Length];
    byte[] tag = new byte[16];
    
    aesGcm.Encrypt(flippedIv, plaintext, ciphertext, tag);
    
    // 4. Combine ciphertext + tag
    byte[] encrypted = new byte[ciphertext.Length + tag.Length];
    Buffer.BlockCopy(ciphertext, 0, encrypted, 0, ciphertext.Length);
    Buffer.BlockCopy(tag, 0, encrypted, ciphertext.Length, tag.Length);
    
    // 5. Base64 encode
    return Convert.ToBase64String(encrypted);
}
```

### HMAC-SHA256 (Webhook Validation)

Valida integridade dos webhooks do WhatsApp:

```csharp
public bool ValidateSignature(string body, string signature, string appSecret)
{
    string expectedSignature = "sha256=" + ComputeHmacSha256(body, appSecret);
    return signature == expectedSignature;
}

private static string ComputeHmacSha256(string data, string key)
{
    byte[] keyBytes = Encoding.UTF8.GetBytes(key);
    byte[] dataBytes = Encoding.UTF8.GetBytes(data);
    
    using var hmac = new HMACSHA256(keyBytes);
    byte[] hashBytes = hmac.ComputeHash(dataBytes);
    
    return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
}
```

---

## 💾 Banco de Dados

### DeviceDatabase (In-Memory)

Banco de dados em memória com 30 dispositivos de exemplo.

**Marcas:**
- **Apple:** 9 dispositivos (iPhone 15 Pro Max, 15 Pro, 15)
- **Samsung:** 6 dispositivos (Galaxy S24 Ultra, S24, A55)
- **Motorola:** 4 dispositivos (Edge 50 Pro, G84, Razr 50 Ultra)
- **Xiaomi:** 11 dispositivos (Poco F6 Pro, Redmi Note 13 Pro, Mi 14)

**Métodos:**

```csharp
public class DeviceDatabase
{
    // Retorna todas as marcas
    public List<Brand> GetBrands()
    
    // Retorna dispositivos de uma marca
    public List<Device> GetDevicesByBrand(string brand)
    
    // Retorna dispositivos de um modelo
    public List<Device> GetDevicesByModel(string model)
    
    // Retorna dispositivo por ID
    public Device? GetDeviceById(int id)
}
```

**⚠️ NOTA:** Este é um banco de dados de demonstração. Em produção:
- Use SQL Server, PostgreSQL ou MongoDB
- Carregue todos os 332 dispositivos documentados
- Implemente cache (Redis, Memory Cache)

### Adicionar Dispositivos

Edite `Data/DeviceDatabase.cs`:

```csharp
private List<Device> InitializeDevices()
{
    return new List<Device>
    {
        new Device { 
            IdObjectSmartphone = 999, 
            DeModel = "GALAXY A15", 
            DeMemory = "128 GB", 
            Price = 899.00M 
        },
        // ... adicione mais dispositivos
    };
}
```

---

## 🚀 Como Executar

### Desenvolvimento Local

```bash
# 1. Restaurar pacotes NuGet
dotnet restore

# 2. Compilar projeto
dotnet build

# 3. Executar API
dotnet run

# Ou use watch mode (hot reload)
dotnet watch run
```

**API rodando em:**
- HTTPS: `https://localhost:7000`
- HTTP: `http://localhost:5000`

**Swagger UI:**
- `https://localhost:7000/swagger`

### Visual Studio

1. Abra `VendasSeguroCelularAPI.sln`
2. Pressione `F5` para executar
3. Navegue para `https://localhost:7000/swagger`

### VS Code

1. Abra a pasta no VS Code
2. Pressione `F5` (ou use Run and Debug)
3. Selecione `.NET Core Launch (web)`

---

## 🌐 Deploy

### Azure App Service

```bash
# 1. Login no Azure
az login

# 2. Criar Resource Group
az group create --name RG-VendasSeguro --location eastus

# 3. Criar App Service Plan
az appservice plan create \
  --name ASP-VendasSeguro \
  --resource-group RG-VendasSeguro \
  --sku B1 \
  --is-linux

# 4. Criar Web App
az webapp create \
  --name vendas-seguro-api \
  --resource-group RG-VendasSeguro \
  --plan ASP-VendasSeguro \
  --runtime "DOTNET|8.0"

# 5. Deploy
dotnet publish -c Release
cd bin/Release/net8.0/publish
az webapp deployment source config-zip \
  --resource-group RG-VendasSeguro \
  --name vendas-seguro-api \
  --src publish.zip
```

### Configurar Variáveis de Ambiente (Azure)

```bash
az webapp config appsettings set \
  --resource-group RG-VendasSeguro \
  --name vendas-seguro-api \
  --settings \
    WhatsApp__PhoneNumberId="925691370621800" \
    WhatsApp__AccessToken="SEU_TOKEN" \
    WhatsApp__AppSecret="SEU_SECRET" \
    WhatsApp__PrivateKey="-----BEGIN PRIVATE KEY-----
..."
```

**Nota:** Use `__` (double underscore) para seções aninhadas no Azure.

### Docker

```dockerfile
# Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["VendasSeguroCelularAPI.csproj", "./"]
RUN dotnet restore "VendasSeguroCelularAPI.csproj"
COPY . .
RUN dotnet build "VendasSeguroCelularAPI.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "VendasSeguroCelularAPI.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "VendasSeguroCelularAPI.dll"]
```

```bash
# Build
docker build -t vendas-seguro-api .

# Run
docker run -d -p 8080:80 \
  -e WhatsApp__PhoneNumberId="925691370621800" \
  -e WhatsApp__AccessToken="SEU_TOKEN" \
  vendas-seguro-api
```

---

## 🧪 Testes

### Testar Endpoints com cURL

```bash
# Brands
curl https://localhost:7000/api/brands

# Models
curl "https://localhost:7000/api/models?brand=APPLE"

# Memory
curl "https://localhost:7000/api/memory?model=IPHONE%2015%20PRO%20MAX"

# Device
curl "https://localhost:7000/api/device?id=123"

# Webhook verification
curl "https://localhost:7000/api/webhook?hub.mode=subscribe&hub.verify_token=SEU_TOKEN&hub.challenge=test123"
```

### Testar com Postman

1. Importe collection do Swagger: `https://localhost:7000/swagger/v1/swagger.json`
2. Configure environment variables
3. Execute requests

### Unit Tests (Opcional)

Crie projeto de testes:

```bash
dotnet new xunit -n VendasSeguroCelularAPI.Tests
cd VendasSeguroCelularAPI.Tests
dotnet add reference ../VendasSeguroCelularAPI.csproj
dotnet add package Microsoft.AspNetCore.Mvc.Testing
```

---

## 📚 Documentação Adicional

- [WhatsApp Flow Guide](../VendasSeguroCelular/WHATSAPP_FLOW_GUIDE.md) - Documentação completa do projeto Node.js
- [WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/flows)
- [.NET 8 Minimal APIs](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis)
- [System.Security.Cryptography](https://learn.microsoft.com/en-us/dotnet/api/system.security.cryptography)

---

## 🔒 Segurança

### Boas Práticas

- ✅ Nunca commitar `appsettings.json` com dados reais
- ✅ Use `User Secrets` para dev local:
  ```bash
  dotnet user-secrets init
  dotnet user-secrets set "WhatsApp:AccessToken" "SEU_TOKEN"
  ```
- ✅ Use Azure Key Vault em produção
- ✅ Valide SEMPRE a assinatura HMAC dos webhooks
- ✅ Use HTTPS em produção
- ✅ Implemente rate limiting
- ✅ Log erros mas não exponha detalhes ao client

### .gitignore

```gitignore
## Ignore private keys and secrets
appsettings.json
appsettings.*.json
*.pem
*.key
*.pfx

## .NET
bin/
obj/
*.user
*.suo
.vs/
```

---

## 🐛 Troubleshooting

### Erro: "Private key not configured"

**Causa:** `WhatsApp:PrivateKey` não está no `appsettings.json`

**Solução:**
1. Verifique se a chave está presente
2. Certifique-se de incluir `-----BEGIN PRIVATE KEY-----` e `-----END PRIVATE KEY-----`
3. Use `\n` para quebras de linha no JSON

### Erro: "Decryption failed"

**Causa:** Chave privada não corresponde à chave pública do Flow

**Solução:**
1. Regenere o par de chaves
2. Atualize a chave pública no WhatsApp Manager
3. Atualize a chave privada no `appsettings.json`

### Erro 421 no /api/flow

**Significado:** WhatsApp detectou incompatibilidade de chaves

**Solução:** 
- API retorna 421 automaticamente
- WhatsApp vai requisitar nova chave pública
- Verifique logs para detalhes

### Webhook não recebe mensagens

**Checklist:**
1. ✅ Webhook configurado no WhatsApp Manager?
2. ✅ URL HTTPS pública acessível?
3. ✅ `WebhookVerifyToken` correto?
4. ✅ Validação passou (GET request)?
5. ✅ Assinatura HMAC válida (POST request)?

---

## 📞 Suporte

**Desenvolvedor:** Marcos Ducatti  
**Repositório:** [mvducatti/Projetos](https://github.com/mvducatti/Projetos)  
**Branch:** main

---

## 📝 Changelog

### v1.0 - Dezembro 2025
- ✅ Projeto inicial .NET 8 Minimal API
- ✅ 6 endpoints implementados
- ✅ Criptografia RSA + AES-GCM completa
- ✅ Validação HMAC-SHA256
- ✅ Banco de dados in-memory com 30 dispositivos
- ✅ Swagger/OpenAPI documentation
- ✅ README completo

---

**🎉 API pronta para uso! Boas vendas! 🎉**
