# 📱 GUIA COMPLETO - WhatsApp Flow Vendas Seguro Celular

> **Última atualização:** 02/12/2025  
> **Autor:** Marcos Ducatti  
> **Versão API:** Node.js + Express (Vercel Serverless)

---

## 📋 ÍNDICE

1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Arquitetura e Fluxo de Dados](#arquitetura-e-fluxo-de-dados)
3. [Configuração Inicial](#configuração-inicial)
4. [Estrutura de Arquivos](#estrutura-de-arquivos)
5. [Endpoints da API](#endpoints-da-api)
6. [Criptografia e Segurança](#criptografia-e-segurança)
7. [WhatsApp Flow JSON](#whatsapp-flow-json)
8. [Banco de Dados de Dispositivos](#banco-de-dados-de-dispositivos)
9. [Precificação e Planos](#precificação-e-planos)
10. [Validações Implementadas](#validações-implementadas)
11. [Troubleshooting](#troubleshooting)
12. [Checklist de Deploy](#checklist-de-deploy)

---

## 📊 VISÃO GERAL DO SISTEMA

### O que é?
Sistema de vendas de seguro para celulares via WhatsApp Flow, permitindo que usuários selecionem:
- Marca e modelo do aparelho
- Capacidade de memória
- Plano de seguro (Super Econômico, Econômico, Completo)
- Tipo de franquia (Normal ou Reduzida)
- Forma de pagamento (Mensal ou Anual)

### Tecnologias
- **Backend:** Node.js + Express (Vercel Serverless Functions)
- **WhatsApp:** Cloud API v21.0
- **Criptografia:** RSA-2048 OAEP-SHA256 + AES-128-GCM
- **Validação:** HMAC-SHA256 (webhook signature)
- **Deploy:** Vercel

### Fluxo Completo
```
Usuário envia mensagem → Webhook detecta keywords → 
Envia template com Flow → Usuário interage com Flow →
Dados encriptados trocados com API → Validações →
Resumo do pedido → Finalização
```

---

## 🏗️ ARQUITETURA E FLUXO DE DADOS

### Diagrama de Comunicação

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  WhatsApp   │◄────────┤  WhatsApp Cloud  │◄────────┤   Sua API       │
│   Usuário   │         │       API        │         │   (Vercel)      │
└─────────────┘         └──────────────────┘         └─────────────────┘
      ▲                                                        │
      │                                                        │
      └────────────── Encrypted Flow Data ────────────────────┘
```

### Fluxo de Dados Detalhado

1. **Iniciação:**
   - Usuário envia palavra-chave ("quero proteger", "cotação", "seguro")
   - Webhook recebe notificação
   - API envia template com Flow ID

2. **Flow Aberto:**
   - WhatsApp Cloud API envia request encriptado para `/api/flow`
   - Action: `INIT`
   - API descriptografa, carrega marcas, retorna encriptado

3. **Interações (data_exchange):**
   - Cada mudança de dropdown/input gera novo request
   - API processa, valida e retorna novos dados
   - Telas: DEVICE_SELECTION → PLAN_SELECTION → IMEI_VALIDATION → CLIENT_DATA → ORDER_SUMMARY

4. **Finalização (complete):**
   - Usuário confirma pedido
   - API salva dados (em produção: banco de dados)
   - Retorna tela de sucesso

---

## ⚙️ CONFIGURAÇÃO INICIAL

### 1. Variáveis de Ambiente (Vercel)

**OBRIGATÓRIAS** - Configure no Vercel Dashboard → Settings → Environment Variables:

```env
# WhatsApp Cloud API
WHATSAPP_PHONE_NUMBER_ID=925691370621800
WHATSAPP_ACCESS_TOKEN=EAAZA6eVfvYj8BQ...
WHATSAPP_APP_SECRET=9b25c0b986bbdd635ef21a4768a27ca7
WEBHOOK_VERIFY_TOKEN=meu_token_secreto_whatsapp_2025
WHATSAPP_FLOW_ID=1483727616022490
WHATSAPP_TEMPLATE_NAME=venda_zurich_celular
WHATSAPP_TEMPLATE_LANGUAGE=en

# Criptografia (CHAVE RSA COMPLETA COM QUEBRAS DE LINHA)
PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDnYZ3EiPlo/8aJ
x0JQcySuoa4OMXYtE/8DKwTAX8o2yuVxTkhUUy+G8YafdiHzmOpwKno854DYng8c
vYB6ceB/YEKuIdh+eTHDpYISD7W2G6/w8zM11Q05B04hOYjBi5oXOvQe7OJIZ6f/
FcG5+1kn1CQMhCjyu1sk84Sg3giytFaowWT3dQRzSCPrSs2eQndLpUr0+CV0MK+K
prY5i1jsgGkZ2E72jtNXKWqKki9G+NJNLmDhCX43hkBZSEdgDgLxEjAzGfDqGwAi
S38HhkDgQThjsMh2X9eINP7Qt3xbJMkmMc3qzojqYlnX81Fkz43C1QbyqKPmClaN
OI7+K2jZAgMBAAECggEAFVIqbozMpr9C9Tk2RCGIFMtzNX2bTSYVjp4tLujkwk3J
/Lng8lxD+eRRqmoBUOgbWkCfyPLwLYXLELPpnd7WeAZPvqoBwA285zFeHfnynZhJ
iyNt6Zz7PfENYwRhNKx/g3p8OklLxK5AjcHcex3NJl1nAPxApbVb/biu1QAAvy6w
G6IEBFQtoVc6RDiZHGgTkJqkxUoU/wOts2g68H0Owb+GOyJ9o1lowHPUSEXwdcN5
ylat3G6yuIGHjKMOMR5KwCqecbQhPEBthIAyvE8wpF8G+IR6zv3/Qb0YoDBHrp8b
Mkg/m1rf0v8JcU1bsWTmTV4crvBDVYKCpC4msOSzrQKBgQD5XEpgqadn1NB3W4G9
uUijKfYHAGpFvK6oZdpF7MisMx/LmUJrQqXEO9kVs5B5eCZbYMG3gk5IFEGiNmRD
MFmKep7+AOzo4Mz6LekV4FF8YFMGzVBoqKb8MozjKkokIuh+EnKCerWNouqz/K/q
KY8NA1m5z4I7z3amIGGA3+nL9wKBgQDtisZNlWS85igqO3mmQWxJL+B3NYDuuB18
/MjHQYbkj7zGQS4gKMfcy1bpzEW3hCG2ZBMfgmaiexeC3yqa1kgU/mH1mvwdV8j3
oSPqjT6lkqOSIZy5sfbScZPUYOjguSfpLffvFZ1RrYI6IFOugF3kkVewy/QpW+Sb
fz8hfTIdrwKBgCp4V4qjGooKqv7JLQ29MuvnR6nlnjQGcNDpmAV00LDTfETW84MF
NOp5Lv4NOTwXBKFnl1bD8MVB/fO8w9LVt0ponA+y5Ka9MuwhSaOaMwa1+S4dZeaN
YvNtQKWoHDyPXX2rcqlacPWQm9zP2r5NGbojqfKFry60pQaiWTjz6gP9AoGAGeW8
Uu8LqZCKJniPfbG6RYxjs3tw0BXgmSTSGu8o7rhBA3hNuBHaIFdG5XxwyV4tcr4c
W54S5Hn5CTqdYX4lI6zML0OzYtuUPHMkAElf4BtJm//wH0qoty7MyCW8netxz3lE
g5teqG37Oa0WknrKQcYawlqqBuxO0ykfT95fXV8CgYEAtuc8PjQx83NAYnloAJFz
svWaj/zKO2ZT8eqkAhHESaHzGVHu0CEETYUw88bFoUs9ucOp4jxTOJDhNulWD4uj
3S9uBuowxTo5WihgDY3JuzeXOreQry4eaiE76T63hsbYnkAgCqzKGT3kyzQ+Ix6z
+YD+i8CDpQDUho7qfCHS8Pg=
-----END PRIVATE KEY-----

# Email (Opcional - para notificações)
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua_senha_de_app_aqui
```

### 2. Arquivo .env (Local apenas - NÃO COMMITAR)

```env
# Mesmo conteúdo acima, mas só para desenvolvimento local
# NUNCA faça commit do .env
```

### 3. .gitignore (CRÍTICO!)

```gitignore
# Environment variables
.env
.env.local
.env.production

# Private keys
*.pem
*.key
private-key.pem
private.key
public.key

# Node
node_modules/
.vercel

# Config files com dados sensíveis
appsettings.json
```

---

## 📁 ESTRUTURA DE ARQUIVOS

```
VendasSeguroCelular/
│
├── api/                          # Vercel Serverless Functions
│   ├── brands.js                 # GET /api/brands - Lista marcas
│   ├── models.js                 # GET /api/models?brand=X - Lista modelos
│   ├── memory.js                 # GET /api/memory?model=X - Lista memórias
│   ├── device.js                 # GET /api/device?id=X - Detalhes com preço
│   ├── flow.js                   # POST /api/flow - Endpoint principal do Flow
│   └── webhook.js                # GET/POST /api/webhook - Recebe mensagens
│
├── .env                          # Variáveis de ambiente (NÃO COMMITAR)
├── .gitignore                    # Proteção de arquivos sensíveis
├── package.json                  # Dependências Node.js
├── vercel.json                   # Configuração Vercel
├── whatsappflow.json             # Definição completa do Flow
└── WHATSAPP_FLOW_GUIDE.md        # Este documento
```

---

## 🔌 ENDPOINTS DA API

### 1. GET /api/brands

**Descrição:** Retorna lista de marcas disponíveis

**Response:**
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

---

### 2. GET /api/models?brand=APPLE

**Descrição:** Retorna modelos filtrados por marca (sem duplicatas por DeModel)

**Parâmetros:**
- `brand` (required): APPLE, SAMSUNG, MOTOROLA ou XIAOMI

**Response:**
```json
{
  "hasError": false,
  "data": [
    { "IdObjectSmartphone": 123, "DeModel": "IPHONE 15 PRO MAX", "DeMemory": "256 GB" }
  ]
}
```

**Regras:**
- Remove duplicatas usando `Map` com chave `DeModel`
- Mantém apenas primeiro registro de cada modelo único

---

### 3. GET /api/memory?model=IPHONE%2015%20PRO%20MAX

**Descrição:** Retorna opções de memória para modelo específico

**Parâmetros:**
- `model` (required): Nome exato do modelo (URL encoded)

**Response:**
```json
{
  "hasError": false,
  "data": [
    { "IdObjectSmartphone": 123, "DeModel": "IPHONE 15 PRO MAX", "DeMemory": "256 GB" },
    { "IdObjectSmartphone": 124, "DeModel": "IPHONE 15 PRO MAX", "DeMemory": "512 GB" },
    { "IdObjectSmartphone": 125, "DeModel": "IPHONE 15 PRO MAX", "DeMemory": "1 TB" }
  ]
}
```

**Regras:**
- Filtra por `DeModel.toUpperCase() === model.toUpperCase()`
- Retorna TODOS os registros (não remove duplicatas aqui)

---

### 4. GET /api/device?id=123

**Descrição:** Retorna detalhes completos do dispositivo com preço formatado

**Parâmetros:**
- `id` (required): IdObjectSmartphone

**Response:**
```json
{
  "hasError": false,
  "data": {
    "IdObjectSmartphone": 123,
    "DeModel": "IPHONE 15 PRO MAX",
    "DeMemory": "256 GB",
    "Price": 7599.00,
    "FormattedPrice": "R$ 7.599,00"
  }
}
```

---

### 5. POST /api/flow

**Descrição:** Endpoint principal do WhatsApp Flow (dados encriptados)

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "encrypted_flow_data": "base64_encrypted_data",
  "encrypted_aes_key": "base64_encrypted_aes_key",
  "initial_vector": "base64_iv"
}
```

**Decrypted Request (interno):**
```json
{
  "version": "3.0",
  "action": "INIT" | "data_exchange" | "ping" | "complete",
  "screen": "DEVICE_SELECTION" | "PLAN_SELECTION" | "IMEI_VALIDATION" | "CLIENT_DATA" | "ORDER_SUMMARY",
  "data": { ... },
  "flow_token": "unique_token"
}
```

**Response:** Base64 encrypted data

**Actions:**
- `ping`: Health check
- `INIT`: Carrega primeira tela (brands)
- `data_exchange`: Interações (dropdowns, navegação entre telas)
- `complete`: Finalização do pedido

---

### 6. GET/POST /api/webhook

**GET - Verificação:**
```
GET /api/webhook?hub.mode=subscribe&hub.verify_token=meu_token&hub.challenge=12345
Response: 12345
```

**POST - Notificações:**
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "5511999999999",
          "type": "text",
          "text": { "body": "quero proteger meu celular" }
        }]
      }
    }]
  }]
}
```

**Keywords detectadas:**
- "quero proteger"
- "cotação"
- "seguro"

**Ação:** Envia template com Flow ID

---

## 🔐 CRIPTOGRAFIA E SEGURANÇA

### RSA-2048 + AES-128-GCM

**Fluxo de Criptografia:**

1. **Request (WhatsApp → API):**
   ```
   1. WhatsApp gera chave AES aleatória (128 bits)
   2. Criptografa dados do Flow com AES-128-GCM
   3. Criptografa chave AES com RSA-2048 public key
   4. Envia: encrypted_flow_data + encrypted_aes_key + initial_vector
   ```

2. **API Descriptografa:**
   ```javascript
   // Descriptografa chave AES com RSA private key
   const decryptedAesKey = crypto.privateDecrypt({
     key: PRIVATE_KEY,
     oaepHash: 'sha256',
     padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
   }, Buffer.from(encrypted_aes_key, 'base64'));

   // Descriptografa dados com AES-128-GCM
   const decipher = crypto.createDecipheriv('aes-128-gcm', decryptedAesKey, ivBuffer);
   decipher.setAuthTag(authTag);
   let decrypted = decipher.update(encryptedData, null, 'utf8');
   decrypted += decipher.final('utf8');
   ```

3. **Response (API → WhatsApp):**
   ```javascript
   // Inverte IV (flip bits)
   const flippedIv = Buffer.alloc(ivBuffer.length);
   for (let i = 0; i < ivBuffer.length; i++) {
     flippedIv[i] = ~ivBuffer[i];
   }

   // Criptografa resposta com AES-128-GCM
   const cipher = crypto.createCipheriv('aes-128-gcm', aesKey, flippedIv);
   let encrypted = cipher.update(JSON.stringify(response), 'utf8');
   encrypted = Buffer.concat([encrypted, cipher.final()]);
   const authTag = cipher.getAuthTag();
   return Buffer.concat([encrypted, authTag]).toString('base64');
   ```

### Webhook Signature (HMAC-SHA256)

**Validação:**
```javascript
const signature = req.headers['x-hub-signature-256'];
const expectedSignature = 'sha256=' + crypto
  .createHmac('sha256', WHATSAPP_APP_SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex');

if (signature !== expectedSignature) {
  return res.status(401).send('Invalid signature');
}
```

### ⚠️ IMPORTANTE: Chave Privada no Vercel

**NÃO use arquivo .pem!** A API lê direto de `process.env.PRIVATE_KEY`.

**Configure no Vercel:**
1. Vercel Dashboard → Seu Projeto → Settings → Environment Variables
2. Nome: `PRIVATE_KEY`
3. Valor: Cole a chave RSA COMPLETA (incluindo `-----BEGIN PRIVATE KEY-----` e quebras de linha)
4. Scope: Production, Preview, Development

**O arquivo `private-key.pem` local NÃO é usado em produção!**

---

## 📱 WHATSAPP FLOW JSON

### Estrutura Completa (6 Telas)

```json
{
  "version": "5.1",
  "screens": [
    {
      "id": "DEVICE_SELECTION",
      "title": "Selecione seu Aparelho",
      "terminal": false,
      "data": {},
      "layout": {
        "type": "SingleColumnLayout",
        "children": [
          {
            "type": "Form",
            "name": "device_form",
            "children": [
              {
                "type": "Dropdown",
                "name": "selected_brand",
                "label": "Marca",
                "required": true,
                "data-source": "${data.brands}"
              },
              {
                "type": "Dropdown",
                "name": "selected_model",
                "label": "Modelo",
                "required": true,
                "enabled": "${data.selected_brand != ''}",
                "data-source": "${data.models}"
              },
              {
                "type": "Dropdown",
                "name": "selected_memory",
                "label": "Memória",
                "required": true,
                "enabled": "${data.selected_model != ''}",
                "data-source": "${data.memories}"
              },
              {
                "type": "Footer",
                "label": "Continuar",
                "on-click-action": {
                  "name": "navigate",
                  "next": { "type": "screen", "name": "PLAN_SELECTION" },
                  "payload": {
                    "device_id": "${data.device_id}",
                    "navigate_to": "PLAN_SELECTION"
                  }
                }
              }
            ]
          }
        ]
      }
    }
  ]
}
```

### Limitações Importantes

#### 1. Dropdowns - Formato Estrito
**✅ Correto:**
```json
[
  { "id": "APPLE", "title": "Apple" },
  { "id": "SAMSUNG", "title": "Samsung" }
]
```

**❌ ERRO - Campos extras causam falha silenciosa:**
```json
[
  { "id": "APPLE", "title": "Apple", "DeModel": "IPHONE 15" }  // ❌ Campo extra!
]
```

#### 2. Limite de Caracteres em Labels
**Máximo: 20 caracteres**

**✅ Correto:**
```json
{ "label": "IMEI (15 dígitos)" }  // 18 caracteres
```

**❌ ERRO:**
```json
{ "label": "IMEI (Opcional se enviar foto)" }  // 31 caracteres - FALHA!
```

#### 3. Terminal Screens - Limitação de Variáveis
**Telas terminais (SUCCESS) suportam apenas 1 variável de texto!**

**✅ Correto:**
```json
{
  "type": "TextBody",
  "text": "${data.summary_text}"  // Uma variável única com todo o texto
}
```

**❌ ERRO - Múltiplas variáveis não funcionam:**
```json
{
  "type": "TextBody",
  "text": "Nome: ${data.client_name}\nCPF: ${data.cpf}"  // ❌ Não renderiza!
}
```

**Solução:** Concatene tudo no backend:
```javascript
const summaryText = `RESUMO DO PEDIDO

DADOS DO CLIENTE
Nome: ${full_name}
CPF: ${formattedCpf}

PLANO
${planNames[selectedPlan]}

VALOR
${totalDisplay}`;

return {
  screen: 'ORDER_SUMMARY',
  data: { summary_text: summaryText }  // ✅ Tudo em uma variável
};
```

#### 4. Data Binding - Regras

**Navegação entre telas:**
```javascript
{
  "on-click-action": {
    "name": "navigate",
    "next": { "type": "screen", "name": "PLAN_SELECTION" },
    "payload": {
      "device_id": "${data.device_id}",
      "navigate_to": "PLAN_SELECTION"  // Flag para API detectar navegação
    }
  }
}
```

**Dynamic updates (data_exchange):**
```javascript
{
  "on-click-action": {
    "name": "data_exchange",  // NÃO navega, só atualiza dados
    "payload": {
      "selected_plan": "${form.selected_plan}",
      "billing_type": "${form.billing_type}",
      "franchise": "${form.franchise}"
    }
  }
}
```

---

## 💾 BANCO DE DADOS DE DISPOSITIVOS

### Estrutura de Dados

**Total:** 4 marcas, 241 modelos únicos, 332 dispositivos com preços

#### Marcas Suportadas
```javascript
const brands = [
  { id: "APPLE", name: "Apple" },       // 54 modelos
  { id: "SAMSUNG", name: "Samsung" },   // 65 modelos
  { id: "MOTOROLA", name: "Motorola" }, // 41 modelos
  { id: "XIAOMI", name: "Xiaomi" }      // 81 modelos
];
```

#### Apple (54 modelos)
- iPhone 11 ao 17 (todas variantes: base, Air, Plus, Pro, Pro Max)
- Exemplo: IPHONE 15 PRO MAX (256GB, 512GB, 1TB)

#### Samsung (65 modelos)
- Galaxy S (S20 ao S24, FE, Plus, Ultra)
- Galaxy A (A05 ao A73)
- Galaxy M (M13 ao M55)
- Galaxy Z (Flip 3/4/5/6, Fold 3/4/5/6)
- Exemplo: GALAXY S24 ULTRA (256GB, 512GB, 1TB)

#### Motorola (41 modelos)
- Moto G (G05, G15, G24, G34, G35, G53, G54, G55, G56, G73, G75, G84, G85, G86)
- Moto Edge (30, 30 PRO, 30 ULTRA, 30 FUSION, 30 NEO, 40, 40 NEO, 50, 50 PRO, 50 FUSION, 50 NEO, 50 ULTRA, 60, 60 PRO, 60 FUSION)
- Moto Razr (40, 40 ULTRA, 50, 50 ULTRA, 60, 60 ULTRA)
- Exemplo: MOTO EDGE 50 PRO (256GB, 512GB)

#### Xiaomi (81 modelos)
- Redmi (12, 12C, 13, 13C, 13T PRO, 14C, A3)
- Redmi Note (11, 11S, 11 PRO, 12, 12S, 12 PRO, 13, 13 PRO, 13 PRO PLUS, 14, 14S, 14 PRO, 14 PRO PLUS)
- Poco (M5, M5S, M6 PRO, M7, M7 PRO, C65, C75, C85, X4 PRO, X5, X5 PRO, X6, X6 PRO, X7, X7 PRO, F4, F5, F6, F6 PRO, F7)
- Mi (12 LITE, 13 LITE, 13 PRO, 13T PRO, 14, 14 ULTRA, 14T, 14T PRO, 15)
- Exemplo: POCO F6 PRO (256GB, 512GB, 1TB)

### Formato de Registro

```javascript
{
  IdObjectSmartphone: 123,              // ID único
  DeModel: "IPHONE 15 PRO MAX",         // Nome do modelo (uppercase)
  DeMemory: "256 GB",                    // Capacidade
  Price: 7599.00,                        // Preço numérico
  FormattedPrice: "R$ 7.599,00"         // Preço formatado
}
```

### Faixas de Preço por Marca

| Marca    | Mínimo    | Máximo     | Média Aprox |
|----------|-----------|------------|-------------|
| Apple    | R$ 2.999  | R$ 12.999  | R$ 7.500    |
| Samsung  | R$ 699    | R$ 11.999  | R$ 3.500    |
| Motorola | R$ 599    | R$ 8.999   | R$ 2.500    |
| Xiaomi   | R$ 599    | R$ 5.999   | R$ 1.800    |

### Capacidades de Memória

- **64 GB:** Entrada (principalmente Xiaomi, Samsung linha A)
- **128 GB:** Popular (todas as marcas)
- **256 GB:** Mid-range e Premium (todas as marcas)
- **512 GB:** Premium (Apple, Samsung, Motorola topo, Xiaomi topo)
- **1 TB:** Ultra Premium (Apple, Samsung Ultra, Motorola Razr, Xiaomi Mi/Poco F)
- **2 TB:** Apenas Apple (iPhone 15/16/17 Pro Max)

---

## 💰 PRECIFICAÇÃO E PLANOS

### Planos de Seguro

#### 1. Super Econômico
```javascript
{
  mensal: 19.90,
  anual: 215.00,  // Economia de ~12%
  cobertura: "Básica - Roubo e Furto",
  franquia_normal: "30% do valor do aparelho",
  franquia_reduzida: "15% do valor do aparelho"
}
```

#### 2. Econômico
```javascript
{
  mensal: 34.90,
  anual: 383.00,  // Economia de ~9%
  cobertura: "Intermediária - Roubo, Furto e Danos Acidentais",
  franquia_normal: "25% do valor do aparelho",
  franquia_reduzida: "12% do valor do aparelho"
}
```

#### 3. Completo
```javascript
{
  mensal: 49.90,
  anual: 539.00,  // Economia de ~10%
  cobertura: "Completa - Todos os riscos",
  franquia_normal: "20% do valor do aparelho",
  franquia_reduzida: "10% do valor do aparelho"
}
```

### Cálculo de Preços

```javascript
// Preços base
const basePrices = {
  'super_economico': { mensal: 19.90, anual: 215.00 },
  'economico': { mensal: 34.90, anual: 383.00 },
  'completo': { mensal: 49.90, anual: 539.00 }
};

// Multiplicador de franquia (HARDCODED no flow.js linha ~290)
const franchiseMultiplier = franchise === 'reduzida' ? 1.15 : 1.0;

// Cálculo final
const monthlyPrice = basePrices[selected_plan].mensal * franchiseMultiplier;
const annualPrice = basePrices[selected_plan].anual * franchiseMultiplier;

// Parcelamento anual (11x sem juros)
const installmentValue = Math.ceil(annualPrice / 11);
```

### ⚠️ ATENÇÃO: Multiplicador de Franquia Hardcoded

**Localização:** `api/flow.js` linha ~290

```javascript
const franchiseMultiplier = franchise === 'reduzida' ? 1.15 : 1.0;
```

**Para alterar a porcentagem de 15%:**
1. Edite manualmente o arquivo `api/flow.js`
2. Procure por `franchiseMultiplier`
3. Altere `1.15` para o valor desejado (ex: `1.20` = 20%)
4. Faça commit e deploy no Vercel

**Não existe endpoint ou variável de ambiente para essa configuração!**

### Exemplos de Precificação

#### Exemplo 1: Plano Completo Mensal + Franquia Reduzida
```
Base: R$ 49,90
Multiplicador: 1.15 (franquia reduzida)
Final: R$ 49,90 × 1.15 = R$ 57,39/mês
```

#### Exemplo 2: Plano Econômico Anual + Franquia Normal
```
Base: R$ 383,00
Multiplicador: 1.0 (franquia normal)
Final: R$ 383,00
Parcelamento: R$ 383 ÷ 11 = R$ 35,00/mês (11x sem juros)
```

---

## ✅ VALIDAÇÕES IMPLEMENTADAS

### 1. Validação de IMEI

**Regra:** Opcional OU documento obrigatório

```javascript
// IMEI fornecido? Valida formato
if (imei && imei.trim().length > 0) {
  if (!/^\d{15}$/.test(imei)) {
    return error('IMEI inválido. Deve conter exatamente 15 dígitos numéricos.');
  }
}

// Se não tem IMEI, deve ter documento
if (!hasIMEI && !hasDocuments) {
  return error('Forneça o IMEI OU envie pelo menos um documento para continuar.');
}
```

**Label no Flow:** `"IMEI (15 dígitos)"` (18 caracteres - dentro do limite de 20)

### 2. Validação de CPF

**Algoritmo completo:**

```javascript
// Remove formatação
const cpfClean = cpf.replace(/\D/g, '');

// Verifica tamanho
if (cpfClean.length !== 11) {
  return error('CPF inválido. Deve conter 11 dígitos.');
}

// Rejeita CPFs com todos dígitos iguais
if (/^(\d)\1{10}$/.test(cpfClean)) {
  return error('CPF inválido.');
}

// Calcula dígito verificador 1
let sum = 0;
for (let i = 0; i < 9; i++) {
  sum += parseInt(cpfClean[i]) * (10 - i);
}
let digit1 = 11 - (sum % 11);
if (digit1 >= 10) digit1 = 0;

// Calcula dígito verificador 2
sum = 0;
for (let i = 0; i < 10; i++) {
  sum += parseInt(cpfClean[i]) * (11 - i);
}
let digit2 = 11 - (sum % 11);
if (digit2 >= 10) digit2 = 0;

// Valida
if (digit1 !== parseInt(cpfClean[9]) || digit2 !== parseInt(cpfClean[10])) {
  return error('CPF inválido. Verifique os números digitados.');
}
```

### 3. Validação de Telefone

```javascript
const phoneClean = phone.replace(/\D/g, '');

// Aceita 10 (fixo) ou 11 (celular) dígitos
if (phoneClean.length !== 10 && phoneClean.length !== 11) {
  return error('Telefone inválido. Deve conter 10 ou 11 dígitos (DDD + número).');
}
```

### 4. Validação de Email

```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email.trim())) {
  return error('E-mail inválido. Use um formato válido (exemplo@email.com).');
}
```

### 5. Validação de Idade

```javascript
const birthDate = new Date(birth_date);
const today = new Date();
let age = today.getFullYear() - birthDate.getFullYear();
const monthDiff = today.getMonth() - birthDate.getMonth();

if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
  age--;
}

if (age < 18) {
  return error('Você deve ter pelo menos 18 anos para contratar o seguro.');
}
```

### 6. Validação de Campos Obrigatórios

```javascript
// Nome completo
if (!full_name || full_name.trim().length < 3) {
  return error('Nome completo é obrigatório (mínimo 3 caracteres).');
}

// Email
if (!email || email.trim().length === 0) {
  return error('E-mail é obrigatório.');
}

// Data de nascimento
if (!birth_date) {
  return error('Data de nascimento é obrigatória.');
}
```

---

## 🐛 TROUBLESHOOTING

### Problema 1: "Invalid signature" no Webhook

**Sintoma:** API retorna 401 com mensagem "Invalid signature"

**Causa:** Assinatura HMAC-SHA256 não coincide

**Debug ativado em `webhook.js`:**
```javascript
console.log('📝 Signature comparison:');
console.log('   Received:', signature);
console.log('   Expected:', expectedSignature);
console.log('   Match:', signature === expectedSignature);

// TEMPORÁRIO - permite request mesmo com assinatura inválida
console.log('⚠️ Continuing anyway for debugging...');
```

**Possíveis soluções:**
1. Verifique `WHATSAPP_APP_SECRET` no Vercel
2. Confirme que está usando o App Secret correto (não o Access Token!)
3. Verifique se o body do request não está sendo modificado antes da validação
4. Use `JSON.stringify(req.body)` exatamente como está no código

**Status:** Debug ativo, validação temporariamente bypassada

---

### Problema 2: Dropdown não carrega opções

**Sintoma:** Dropdown aparece vazio ou não habilita

**Causas comuns:**

1. **Campos extras no data-source:**
```javascript
// ❌ ERRO
return data.map(item => ({
  id: item.id,
  title: item.name,
  extraField: item.value  // Campo extra causa falha!
}));

// ✅ CORRETO
return data.map(item => ({
  id: item.id,
  title: item.name
}));
```

2. **Condição enabled não satisfeita:**
```json
{
  "enabled": "${data.selected_brand != ''}",  // Verifica se brand foi selecionado
  "data-source": "${data.models}"
}
```

3. **API retornando erro:**
```javascript
// Sempre retorne mesmo se vazio
if (!brand) {
  return res.status(400).json({
    hasError: true,
    data: []  // Array vazio, não null!
  });
}
```

---

### Problema 3: Flow não abre (botão não responde)

**Sintoma:** Usuário clica no botão do template mas nada acontece

**Checklist:**
1. ✅ `WHATSAPP_FLOW_ID` correto no Vercel?
2. ✅ Flow publicado no WhatsApp Manager?
3. ✅ Endpoint `/api/flow` respondendo 200?
4. ✅ `PRIVATE_KEY` configurada no Vercel?
5. ✅ Chave privada corresponde à chave pública do Flow?

**Teste manual:**
```bash
curl -X POST https://seu-dominio.vercel.app/api/flow \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

**Deve retornar 400 (esperado), não 500!**

---

### Problema 4: Erro 421 na response

**Sintoma:** API retorna HTTP 421

**Significado:** Chave RSA inválida ou expirada

**Ação:** WhatsApp Cloud API vai requisitar nova chave pública

**Soluções:**
1. Verifique se `PRIVATE_KEY` no Vercel está completa (incluindo BEGIN/END)
2. Confirme que a public key no WhatsApp Manager corresponde à private key
3. Regere o par de chaves se necessário:
```bash
# Gerar nova chave privada
openssl genpkey -algorithm RSA -out private-key.pem -pkeyopt rsa_keygen_bits:2048

# Extrair chave pública
openssl rsa -pubout -in private-key.pem -out public-key.pem
```

---

### Problema 5: Tela terminal (SUCCESS) não mostra dados

**Sintoma:** Tela de sucesso aparece em branco ou não mostra variáveis

**Causa:** Terminal screens só aceitam 1 variável!

**❌ ERRO:**
```json
{
  "type": "TextBody",
  "text": "Cliente: ${data.client_name}\nCPF: ${data.cpf}"
}
```

**✅ SOLUÇÃO:**
```javascript
// Backend concatena tudo em UMA string
const summaryText = `Cliente: ${client_name}\nCPF: ${cpf}\n...`;

return {
  screen: 'ORDER_SUMMARY',
  data: { summary_text: summaryText }
};
```

```json
{
  "type": "TextBody",
  "text": "${data.summary_text}"
}
```

---

### Problema 6: Label "must be 20 characters or less"

**Sintoma:** Erro ao publicar Flow

**Causa:** Label de input/dropdown excede 20 caracteres

**Exemplos:**

❌ "IMEI (Opcional se enviar foto)" = 31 caracteres  
✅ "IMEI (15 dígitos)" = 18 caracteres

❌ "Selecione a capacidade de memória" = 35 caracteres  
✅ "Memória" = 7 caracteres

**Regra:** Conte caracteres incluindo espaços e pontuação!

---

### Problema 7: Navigate não funciona

**Sintoma:** Botão clicado mas não muda de tela

**Causa comum:** Falta flag `navigate_to` no payload

**❌ ERRO:**
```json
{
  "on-click-action": {
    "name": "navigate",
    "next": { "type": "screen", "name": "PLAN_SELECTION" },
    "payload": {
      "device_id": "${data.device_id}"
      // Falta navigate_to!
    }
  }
}
```

**✅ CORRETO:**
```json
{
  "on-click-action": {
    "name": "navigate",
    "next": { "type": "screen", "name": "PLAN_SELECTION" },
    "payload": {
      "device_id": "${data.device_id}",
      "navigate_to": "PLAN_SELECTION"  // API detecta navegação
    }
  }
}
```

**Backend deve checar:**
```javascript
if (requestData.navigate_to === 'PLAN_SELECTION') {
  // Carrega dados da tela de destino
  const device = await getDeviceDetails(requestData.device_id);
  return sendEncryptedResponse({
    screen: 'PLAN_SELECTION',
    data: { ... }
  });
}
```

---

## 📋 CHECKLIST DE DEPLOY

### Antes de Fazer Deploy

- [ ] ✅ Todas as variáveis de ambiente configuradas no Vercel
- [ ] ✅ `PRIVATE_KEY` completa (incluindo `-----BEGIN/END-----`)
- [ ] ✅ `.gitignore` protegendo `.env` e `*.pem`
- [ ] ✅ Código testado localmente com `vercel dev`
- [ ] ✅ Flow publicado no WhatsApp Manager
- [ ] ✅ Public key do Flow corresponde à private key no Vercel
- [ ] ✅ Webhook configurado com URL do Vercel
- [ ] ✅ Template aprovado pelo WhatsApp (pode levar 24-48h)

### Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Verify
curl https://seu-dominio.vercel.app/api/brands
```

### Após Deploy

- [ ] ✅ Teste webhook: `GET /api/webhook?hub.mode=subscribe&...`
- [ ] ✅ Teste endpoints: `/api/brands`, `/api/models?brand=APPLE`
- [ ] ✅ Envie mensagem de teste com keyword ("quero proteger")
- [ ] ✅ Verifique se template é enviado
- [ ] ✅ Abra Flow e teste fluxo completo
- [ ] ✅ Confirme logs no Vercel Dashboard → Functions → Logs

### Monitoramento

**Vercel Logs:**
```
https://vercel.com/[seu-usuario]/[seu-projeto]/logs
```

**Filtros úteis:**
- `🔵 FLOW ENDPOINT CALLED` - Requests ao Flow
- `❌ CRITICAL ERROR` - Erros graves
- `🚀 INIT action` - Flow sendo aberto
- `✅ COMPLETE` - Pedido finalizado

---

## 📊 FLUXO COMPLETO (RESUMO VISUAL)

```
┌─────────────────────────────────────────────────────────────────┐
│                    USUÁRIO ENVIA MENSAGEM                       │
│            "quero proteger meu celular"                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  WEBHOOK DETECTA KEYWORD                        │
│              POST /api/webhook                                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│               API ENVIA TEMPLATE COM FLOW ID                    │
│     SendFlowTemplate(flow_id, flow_token)                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│               USUÁRIO CLICA NO BOTÃO DO TEMPLATE                │
│                    Flow abre no WhatsApp                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│             WHATSAPP CLOUD API → POST /api/flow                 │
│   Action: INIT | Encrypted request                             │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                 API DESCRIPTOGRAFA E RESPONDE                   │
│   Screen: DEVICE_SELECTION | Data: brands                      │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│           USUÁRIO SELECIONA MARCA (ex: Apple)                   │
│   data_exchange → selected_brand: "APPLE"                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                 API RETORNA MODELOS DA MARCA                    │
│   Screen: DEVICE_SELECTION | Data: models (54 iPhones)         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│      USUÁRIO SELECIONA MODELO (ex: IPHONE 15 PRO MAX)          │
│   data_exchange → selected_model: "IPHONE 15 PRO MAX"          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              API RETORNA OPÇÕES DE MEMÓRIA                      │
│   Screen: DEVICE_SELECTION | Data: memories (256GB, 512GB, 1TB)│
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│      USUÁRIO SELECIONA MEMÓRIA E CLICA "CONTINUAR"             │
│   navigate → PLAN_SELECTION | device_id: 123                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              API CARREGA TELA DE PLANOS                         │
│   Screen: PLAN_SELECTION | Data: device info + price_display   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│    USUÁRIO SELECIONA PLANO, FRANQUIA, FORMA DE PAGAMENTO       │
│   data_exchange → Atualiza price_display dinamicamente         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│         USUÁRIO CLICA "CONTINUAR" → IMEI_VALIDATION            │
│   Fornece IMEI (15 dígitos) OU envia fotos do aparelho         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              API VALIDA IMEI/DOCUMENTOS                         │
│   Se válido → Screen: CLIENT_DATA                              │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│          USUÁRIO PREENCHE DADOS PESSOAIS                        │
│   Nome, CPF, Email, Telefone, Data de Nascimento               │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│         API VALIDA TODOS OS CAMPOS (CPF, Email, Idade)          │
│   Se válido → Screen: ORDER_SUMMARY (terminal)                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              TELA DE RESUMO (summary_text)                      │
│   Cliente visualiza todos os dados antes de confirmar          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│           USUÁRIO CONFIRMA PEDIDO                               │
│   Action: complete | Pedido salvo                              │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                TELA DE SUCESSO (SUCCESS)                        │
│   "Pedido finalizado com sucesso! Em breve entraremos em contato"│
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚨 PONTOS CRÍTICOS - NÃO ESQUEÇA!

### 1. Chave Privada
- ✅ Configurada como variável `PRIVATE_KEY` no Vercel (não arquivo!)
- ✅ Inclui `-----BEGIN PRIVATE KEY-----` e `-----END PRIVATE KEY-----`
- ✅ Preserva quebras de linha originais
- ✅ Corresponde à public key no WhatsApp Manager

### 2. Dropdowns
- ✅ Apenas `{id, title}` - nenhum campo extra!
- ✅ Retornar array vazio `[]` se não houver dados, nunca `null`

### 3. Labels
- ✅ Máximo 20 caracteres (incluindo espaços e pontuação)

### 4. Terminal Screens
- ✅ UMA variável de texto apenas (`${data.summary_text}`)
- ✅ Concatenar tudo no backend antes de enviar

### 5. Navegação
- ✅ Incluir flag `navigate_to` no payload
- ✅ Backend detecta flag e carrega dados da tela de destino

### 6. Franquia Reduzida
- ✅ Porcentagem hardcoded em `api/flow.js` linha ~290
- ✅ Para alterar: editar manualmente `const franchiseMultiplier = 1.15;`

### 7. Validações
- ✅ CPF com algoritmo completo (dígitos verificadores)
- ✅ IMEI opcional MAS documento obrigatório se IMEI vazio
- ✅ Idade mínima 18 anos

### 8. Git Security
- ✅ `.env` no `.gitignore`
- ✅ `*.pem` e `*.key` no `.gitignore`
- ✅ Nunca commitar chaves privadas ou tokens

---

## 📞 CONTATO E SUPORTE

**Desenvolvedor:** Marcos Ducatti  
**Projeto:** VendasSeguroCelular  
**Repositório:** mvducatti/Projetos  
**Branch:** main

**WhatsApp Cloud API Docs:**  
https://developers.facebook.com/docs/whatsapp/flows

**Vercel Docs:**  
https://vercel.com/docs

---

## 🎓 LIÇÕES APRENDIDAS

### 1. Chaves RSA - Gestão e Deployment

#### ❌ O que NÃO funciona:
```javascript
// NÃO use caminho de arquivo no código de produção!
const fs = require('fs');
const PRIVATE_KEY = fs.readFileSync('./private-key.pem', 'utf8');
```

**Problemas:**
- Vercel Serverless Functions são stateless - arquivos não persistem entre invocações
- Arquivo `.pem` local não é enviado ao Vercel no deploy
- Path relativo pode falhar dependendo do working directory

#### ✅ Solução que funciona:
```javascript
// Leia diretamente da variável de ambiente
const PRIVATE_KEY = process.env.PRIVATE_KEY;
```

**No Vercel Dashboard:**
1. Settings → Environment Variables
2. Nome: `PRIVATE_KEY`
3. Valor: Cola a chave COMPLETA incluindo:
   - `-----BEGIN PRIVATE KEY-----`
   - Todo o conteúdo base64
   - `-----END PRIVATE KEY-----`
   - **Preservando quebras de linha originais!**

**Formato correto no Vercel:**
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDnYZ3EiPlo/8aJ
x0JQcySuoa4OMXYtE/8DKwTAX8o2yuVxTkhUUy+G8YafdiHzmOpwKno854DYng8c
...
-----END PRIVATE KEY-----
```

#### 🔑 Arquivo .pem é desnecessário em produção!
- Útil apenas para desenvolvimento local
- Pode ser deletado após configurar variável de ambiente no Vercel
- `.gitignore` deve proteger `*.pem` de qualquer forma

---

### 2. WhatsApp Flow Dropdowns - Formato Rígido

#### ❌ Erro comum que causa falha silenciosa:
```javascript
// API retorna dados com campos extras
return res.json({
  data: [
    {
      id: "APPLE",
      title: "Apple",
      DeModel: "IPHONE 15",        // ❌ Campo extra!
      DeMemory: "256 GB",           // ❌ Campo extra!
      Price: 7599.00                // ❌ Campo extra!
    }
  ]
});
```

**Resultado:** Dropdown aparece vazio, sem erros no console!

#### ✅ Formato correto (APENAS id e title):
```javascript
return res.json({
  data: [
    {
      id: "APPLE",
      title: "Apple"
      // NADA MAIS! Nem comentários, nem campos vazios!
    }
  ]
});
```

#### 🎯 Regra de ouro:
**WhatsApp Flow dropdowns aceitam EXATAMENTE 2 campos: `id` e `title`. Qualquer coisa a mais = falha!**

**Solução no código:**
```javascript
// Filtrar explicitamente para garantir apenas id e title
return data.map(item => ({
  id: item.IdObjectSmartphone.toString(),
  title: item.DeMemory
  // Não retorne item completo! Use map para criar objeto limpo
}));
```

---

### 3. Terminal Screens - Limitação de Variáveis

#### ❌ Tentativa que NÃO funciona:
```json
{
  "id": "SUCCESS",
  "terminal": true,
  "layout": {
    "children": [
      {
        "type": "TextHeading",
        "text": "Pedido de ${data.client_name}"
      },
      {
        "type": "TextBody",
        "text": "CPF: ${data.cpf}\nTelefone: ${data.phone}"
      }
    ]
  }
}
```

**Resultado:** Texto aparece literal (não interpola as variáveis)!

#### ✅ Solução: UMA variável única com todo o conteúdo

**Backend concatena tudo:**
```javascript
const summaryText = `RESUMO DO PEDIDO

DADOS DO CLIENTE
Nome: ${full_name}
CPF: ${formattedCpf}
Email: ${formattedEmail}
Telefone: ${formattedPhone}
Data de Nascimento: ${birth_date}

DADOS DO APARELHO
Dispositivo: ${device.DeModel} - ${device.DeMemory}

PLANO CONTRATADO
Plano: ${planNames[selectedPlan]}
Franquia: ${franchiseLabel}
Forma de Cobrança: ${billingLabel}

VALOR FINAL
${totalDisplay}`;

return {
  screen: 'ORDER_SUMMARY',
  data: {
    summary_text: summaryText  // UMA variável com tudo
  }
};
```

**Flow JSON:**
```json
{
  "type": "TextBody",
  "text": "${data.summary_text}"
}
```

#### 🎯 Regra:
**Terminal screens suportam APENAS 1 variável de texto. Múltiplas variáveis não funcionam!**

---

### 4. Labels de Componentes - Limite de 20 Caracteres

#### ❌ Erro de validação do Flow:
```json
{
  "type": "TextInput",
  "name": "imei",
  "label": "IMEI (Opcional se enviar foto)",  // 31 caracteres - ERRO!
  "required": false
}
```

**Erro ao publicar Flow:**
```
TextInput 'imei' 'label' must be 20 characters or less
```

#### ✅ Solução: Abreviar para máximo 20 caracteres
```json
{
  "type": "TextInput",
  "name": "imei",
  "label": "IMEI (15 dígitos)",  // 18 caracteres - OK!
  "required": false
}
```

#### 📏 Regra de contagem:
- **Inclui espaços**
- **Inclui pontuação**
- **Inclui acentos**
- Use contador de caracteres antes de definir labels!

**Exemplos corretos:**
- ✅ "Marca" (5 chars)
- ✅ "Modelo do aparelho" (18 chars)
- ✅ "Memória" (7 chars)
- ✅ "CPF" (3 chars)
- ✅ "Telefone com DDD" (16 chars)

---

### 5. Navegação entre Telas - Flag de Controle

#### ❌ Tentativa que não funciona:
```json
{
  "type": "Footer",
  "label": "Continuar",
  "on-click-action": {
    "name": "navigate",
    "next": { "type": "screen", "name": "PLAN_SELECTION" },
    "payload": {
      "device_id": "${data.device_id}"
      // Falta flag para API diferenciar navegação de data_exchange
    }
  }
}
```

**Backend não consegue diferenciar:**
```javascript
// Como saber se é navegação ou apenas update de dados?
if (action === 'data_exchange') {
  // Pode ser navegação OU apenas mudança de dropdown!
}
```

#### ✅ Solução: Adicionar flag `navigate_to`

**Flow JSON:**
```json
{
  "type": "Footer",
  "label": "Continuar",
  "on-click-action": {
    "name": "navigate",
    "next": { "type": "screen", "name": "PLAN_SELECTION" },
    "payload": {
      "device_id": "${data.device_id}",
      "navigate_to": "PLAN_SELECTION"  // ✅ Flag explícita!
    }
  }
}
```

**Backend detecta navegação:**
```javascript
if (screen === 'DEVICE_SELECTION') {
  // Verifica se é navegação para próxima tela
  if (requestData.navigate_to === 'PLAN_SELECTION') {
    const device = await getDeviceDetails(requestData.device_id);
    return sendEncryptedResponse({
      screen: 'PLAN_SELECTION',
      data: { ...device, ... }
    });
  }
  
  // Senão, é apenas update de dropdowns na mesma tela
  return sendEncryptedResponse({
    screen: 'DEVICE_SELECTION',
    data: { brands, models, memories, ... }
  });
}
```

#### 🎯 Padrão:
**Sempre adicione flag `navigate_to` em botões que mudam de tela. Isso facilita a lógica no backend!**

---

### 6. Data Exchange vs Navigate - Diferença Crucial

#### Ações disponíveis no Flow:

**1. `data_exchange` - Atualização na mesma tela:**
```json
{
  "type": "RadioButtonsGroup",
  "name": "selected_plan",
  "on-select-action": {
    "name": "data_exchange",  // NÃO muda de tela
    "payload": {
      "selected_plan": "${form.selected_plan}",
      "billing_type": "${form.billing_type}"
    }
  }
}
```

**Uso:** Atualizar preço, carregar modelos ao selecionar marca, etc.

**2. `navigate` - Mudança de tela:**
```json
{
  "type": "Footer",
  "label": "Continuar",
  "on-click-action": {
    "name": "navigate",  // Muda de tela
    "next": { "type": "screen", "name": "PLAN_SELECTION" }
  }
}
```

**Uso:** Botões "Continuar", "Voltar", "Finalizar"

#### 🎯 Quando usar cada um:

| Situação | Action | Resposta Backend |
|----------|--------|------------------|
| Dropdown mudou | `data_exchange` | Mesma tela com dados atualizados |
| Radio button selecionado | `data_exchange` | Mesma tela com cálculo novo |
| Botão "Continuar" | `navigate` | **Nova tela** com dados carregados |
| Input preenchido (sem submit) | `data_exchange` | Validação parcial, mesma tela |

---

### 7. Validações de Formulário - Retornar Mesma Tela com Erros

#### ❌ Tentativa que confunde o usuário:
```javascript
// API valida e retorna erro genérico
if (!isValidCPF(cpf)) {
  return res.status(400).json({ error: 'CPF inválido' });
}
```

**Resultado:** Flow trava ou fecha!

#### ✅ Solução: Retornar mesma tela com mensagem de erro

```javascript
// Validação no backend
if (!isValidCPF(cpfClean)) {
  return sendEncryptedResponse({
    screen: 'CLIENT_DATA',  // Mesma tela!
    data: {
      cpf_error: 'CPF inválido. Verifique os números digitados.',
      phone_error: '',  // Limpa outros erros
      birth_date_error: ''
    }
  });
}

// Se tudo válido, navega para próxima tela
return sendEncryptedResponse({
  screen: 'ORDER_SUMMARY',  // Próxima tela
  data: { ... }
});
```

**Flow JSON (campos de erro):**
```json
{
  "type": "TextInput",
  "name": "cpf",
  "label": "CPF",
  "required": true
},
{
  "type": "TextCaption",
  "text": "${data.cpf_error}",
  "visible": "${data.cpf_error != ''}"
}
```

#### 🎯 Padrão de validação:
1. Recebe dados do formulário
2. Valida cada campo
3. **Se erro:** Retorna MESMA tela com campos `*_error` preenchidos
4. **Se sucesso:** Retorna PRÓXIMA tela com dados limpos

---

### 8. IMEI Opcional vs Documentos - Validação Condicional

#### Requisito de negócio:
"Usuário deve fornecer IMEI OU enviar foto dos documentos do aparelho"

#### ❌ Abordagem errada:
```json
{
  "type": "TextInput",
  "name": "imei",
  "required": true  // ❌ Força IMEI sempre!
}
```

#### ✅ Solução: Campos opcionais + validação no backend

**Flow JSON:**
```json
{
  "type": "TextInput",
  "name": "imei",
  "label": "IMEI (15 dígitos)",
  "required": false  // ✅ Opcional!
},
{
  "type": "PhotoPicker",
  "name": "device_documents",
  "required": false  // ✅ Opcional também!
}
```

**Backend valida lógica OR:**
```javascript
const imei = requestData.imei;
const device_documents = requestData.device_documents;

const hasIMEI = imei && imei.trim().length > 0;
const hasDocuments = device_documents && Array.isArray(device_documents) && device_documents.length > 0;

// Pelo menos UM método deve ser fornecido
if (!hasIMEI && !hasDocuments) {
  return sendEncryptedResponse({
    screen: 'IMEI_VALIDATION',
    data: {
      imei_error: 'Forneça o IMEI OU envie pelo menos um documento para continuar.',
      is_validating: false
    }
  });
}

// Se IMEI fornecido, valida formato
if (hasIMEI && !/^\d{15}$/.test(imei)) {
  return sendEncryptedResponse({
    screen: 'IMEI_VALIDATION',
    data: {
      imei_error: 'IMEI inválido. Deve conter exatamente 15 dígitos numéricos.',
      is_validating: false
    }
  });
}

// Pelo menos uma validação OK, prossegue
console.log('✅ Validation passed - proceeding to CLIENT_DATA');
return sendEncryptedResponse({
  screen: 'CLIENT_DATA',
  data: { ... }
});
```

#### 🎯 Lição:
**Para validações condicionais (OR/AND), deixe campos opcionais no Flow e valide a lógica no backend!**

---

### 9. Signature Validation - HMAC-SHA256 Intermitente

#### Problema reportado:
"Funciona para mim mas não funciona para minha esposa"

#### Investigação:
```javascript
// Log adicionado no webhook
const signature = req.headers['x-hub-signature-256'];
const expectedSignature = 'sha256=' + crypto
  .createHmac('sha256', WHATSAPP_APP_SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex');

console.log('📝 Signature comparison:');
console.log('   Received:', signature);
console.log('   Expected:', expectedSignature);
console.log('   Match:', signature === expectedSignature);
```

#### Possíveis causas identificadas:

1. **Body parsing inconsistente:**
```javascript
// Se middleware altera req.body antes da validação
app.use(express.json()); // Já parseia o body
// Mas HMAC precisa do raw body original!
```

**Solução:** Validar signature ANTES de parsear JSON (ou salvar raw body)

2. **Caching intermediário:**
- CDN pode estar cacheando resposta antiga
- Proxy pode estar modificando headers

3. **Múltiplas requisições simultâneas:**
- Race condition se duas messages chegam juntas

#### ✅ Solução temporária (debug ativo):
```javascript
if (signature !== expectedSignature) {
  console.error('❌ Signature validation failed!');
  console.error('   This may be a false positive - continuing for debugging...');
  // return res.status(401).send('Invalid signature');  // Comentado temporariamente
}

// Continue processing...
console.log('⚠️ Continuing anyway for debugging...');
```

#### 🔍 Estado atual:
**Debug logging ativo, validação bypassada temporariamente para investigação contínua.**

---

### 10. Deduplicate Models - Map vs Filter

#### Problema:
"Banco de dados tem vários registros do mesmo modelo (memórias diferentes), mas dropdown de modelos deve mostrar cada modelo apenas uma vez"

#### ❌ Tentativa com filter (não funciona):
```javascript
// Remove duplicatas consecutivas, mas não todos os duplicados!
const uniqueModels = allModels.filter((item, index, arr) => {
  return index === 0 || item.DeModel !== arr[index - 1].DeModel;
});
```

**Problema:** Só remove duplicatas consecutivas se array estiver ordenado!

#### ✅ Solução: Usar Map para garantir unicidade

```javascript
function uniqueModels(models) {
  const uniqueMap = new Map();
  
  models.forEach(item => {
    // Map usa DeModel como chave - automaticamente sobrescreve duplicatas
    if (!uniqueMap.has(item.DeModel)) {
      uniqueMap.set(item.DeModel, item);
    }
  });
  
  // Converte Map de volta para array
  return Array.from(uniqueMap.values());
}
```

**Uso:**
```javascript
// api/models.js
if (brand.toUpperCase() === 'APPLE') {
  models = uniqueModels(appleModels);  // Remove duplicatas
}
```

#### 🎯 Vantagens do Map:
- Garante unicidade pela chave (DeModel)
- Não depende de ordenação
- Performance O(n) - percorre array apenas uma vez
- Mantém primeira ocorrência de cada modelo

---

### 11. Formatação de Preços - Locale pt-BR

#### Requisito:
"Mostrar preço no formato brasileiro: R$ 7.599,00"

#### ❌ Tentativa manual (propenso a erros):
```javascript
const formatted = 'R$ ' + price.toFixed(2).replace('.', ',');
// R$ 7599,00 - falta separador de milhar!
```

#### ✅ Solução: Usar Intl.NumberFormat

```javascript
// api/device.js
devices.map(device => ({
  ...device,
  FormattedPrice: new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(device.Price)
}))
```

**Resultado:** `R$ 7.599,00` (automático!)

#### 🌍 Benefícios:
- Separador de milhar correto (7.599)
- Vírgula decimal (,00)
- Símbolo da moeda (R$)
- Funciona para qualquer locale (en-US, es-ES, etc.)

---

### 12. Environment Variables - Vercel vs Local

#### Diferenças importantes:

**Local (.env file):**
```env
PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgk..."
# Precisa escapar \n para quebras de linha
```

**Vercel Dashboard:**
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDnYZ3EiPlo/8aJ
x0JQcySuoa4OMXYtE/8DKwTAX8o2yuVxTkhUUy+G8YafdiHzmOpwKno854DYng8c
...
-----END PRIVATE KEY-----
# Quebras de linha REAIS (não \n)
```

#### ✅ Como configurar corretamente:

**1. Para desenvolvimento local:**
```bash
# .env
PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDnYZ3EiPlo/8aJ
x0JQcySuoa4OMXYtE/8DKwTAX8o2yuVxTkhUUy+G8YafdiHzmOpwKno854DYng8c
...
-----END PRIVATE KEY-----"
```

**2. Para Vercel:**
- Cole no campo de texto do dashboard
- Vercel preserva formatação automaticamente
- NÃO escape \n

**3. Leitura no código:**
```javascript
const PRIVATE_KEY = process.env.PRIVATE_KEY;
// Funciona igual em local e produção!
```

#### 🔒 Segurança:
- ✅ `.env` no `.gitignore`
- ✅ Nunca commitar chaves
- ✅ Variáveis diferentes por ambiente (dev/prod)
- ✅ Rodar `git rm --cached .env` se commitou por acidente

---

### 13. Debug Logging - Console.log Estruturado

#### ❌ Logs genéricos (difíceis de filtrar):
```javascript
console.log('Request received');
console.log(req.body);
console.log('Processing...');
```

#### ✅ Logs estruturados com emojis (fácil de filtrar):

```javascript
console.log('\n\n========================================');
console.log('🔵 FLOW ENDPOINT CALLED at', new Date().toISOString());
console.log('========================================');
console.log('📍 URL:', req.url);
console.log('🔧 Method:', req.method);
console.log('📋 Headers:', JSON.stringify(req.headers, null, 2));
console.log('🌐 Query:', JSON.stringify(req.query || {}, null, 2));
console.log('📦 Body type:', typeof body);

// ...

console.log('✅ Decryption successful!');
console.log('📋 Decrypted request:', JSON.stringify(decryptedRequest, null, 2));

// ...

console.error('\n❌❌❌ CRITICAL ERROR ❌❌❌');
console.error('Error name:', error.name);
console.error('Error message:', error.message);
console.error('Error stack:', error.stack);
console.error('========================================\n');
```

#### 📊 Filtros no Vercel Logs:
- `🔵 FLOW ENDPOINT` - Requisições ao Flow
- `🚀 INIT action` - Flow sendo aberto
- `💰 PLAN_SELECTION` - Tela de planos
- `✅ COMPLETE` - Pedido finalizado
- `❌ CRITICAL ERROR` - Erros graves
- `🔐 Attempting decryption` - Debug de criptografia

#### 🎯 Benefício:
**Logs visuais facilitam troubleshooting em produção sem ferramentas extras!**

---

### 14. Serverless Functions - Stateless Constraints

#### ❌ O que NÃO funciona em Vercel Serverless:

**1. Armazenamento de arquivos:**
```javascript
const fs = require('fs');
fs.writeFileSync('orders.json', JSON.stringify(orders));  // ❌ Não persiste!
```

**2. Variáveis globais entre invocações:**
```javascript
let orderCount = 0;  // ❌ Reseta a cada cold start!

export default function handler(req, res) {
  orderCount++;  // Não confiável!
}
```

**3. Sessões em memória:**
```javascript
const sessions = new Map();  // ❌ Perde dados entre invocações!
```

#### ✅ O que funciona:

**1. Armazenamento temporário dentro da mesma requisição:**
```javascript
const orderDataStore = new Map();  // OK para mesma execução

export default async function handler(req, res) {
  // Salva temporariamente
  orderDataStore.set(flow_token, orderData);
  
  // Usa na mesma requisição
  const data = orderDataStore.get(flow_token);
  
  // Limpa no final
  orderDataStore.delete(flow_token);
}
```

**2. Variáveis de ambiente (imutáveis):**
```javascript
const API_KEY = process.env.API_KEY;  // ✅ Sempre disponível
```

**3. Banco de dados externo:**
```javascript
// MongoDB, PostgreSQL, Redis, etc.
const order = await db.orders.insert(orderData);  // ✅ Persiste!
```

#### 🏗️ Arquitetura recomendada para produção:
- **State:** Database (MongoDB Atlas, Supabase, PlanetScale)
- **Cache:** Redis (Upstash, Railway)
- **Files:** Object Storage (S3, Cloudinary)
- **Queue:** Vercel Edge Config, Inngest

---

### 15. Git Security - .gitignore Retroativo

#### Problema:
"Commitei `.env` e `private-key.pem` antes de adicionar ao `.gitignore`. Como remover?"

#### ❌ Apenas adicionar ao .gitignore NÃO remove do histórico:
```bash
echo "*.pem" >> .gitignore
git add .gitignore
git commit -m "Add .gitignore"
# ❌ Arquivo ainda está no histórico do Git!
```

#### ✅ Solução: Remover do índice com --cached

```bash
# 1. Adicionar ao .gitignore
echo "*.pem" >> .gitignore
echo ".env" >> .gitignore

# 2. Remover do índice (mas manter localmente)
git rm --cached private-key.pem
git rm --cached .env

# 3. Commit
git add .gitignore
git commit -m "Remove sensitive files from tracking"

# 4. Push
git push origin main
```

#### ⚠️ ATENÇÃO:
**Arquivo ainda existe no histórico anterior!** Para remover completamente:

```bash
# Use git filter-branch ou BFG Repo-Cleaner
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch private-key.pem" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (cuidado!)
git push origin --force --all
```

#### 🔒 Prevenção:
1. Criar `.gitignore` ANTES do primeiro commit
2. Usar template de `.gitignore` para Node.js
3. Revisar `git status` antes de cada commit
4. Usar pre-commit hooks (Husky + lint-staged)

---

### 16. Hardcoded Values - Quando é Aceitável

#### Valores hardcoded no projeto:

**1. Multiplicador de franquia reduzida (15%):**
```javascript
// api/flow.js linha ~290
const franchiseMultiplier = franchise === 'reduzida' ? 1.15 : 1.0;
```

**Justificativa:** 
- Valor fixo do produto, muda raramente
- Não precisa ser configurável por usuário
- Alteração requer deploy (processo controlado)

**2. Preços dos planos:**
```javascript
const basePrices = {
  'super_economico': { mensal: 19.90, anual: 215.00 },
  'economico': { mensal: 34.90, anual: 383.00 },
  'completo': { mensal: 49.90, anual: 539.00 }
};
```

**Justificativa:**
- Preços de produto, não configurações técnicas
- Mudanças devem ser rastreadas (Git)
- Requer testes após alteração

**3. Nomes de telas do Flow:**
```javascript
if (screen === 'DEVICE_SELECTION') { ... }
if (screen === 'PLAN_SELECTION') { ... }
```

**Justificativa:**
- Estrutura do Flow, não dados
- Acoplado ao JSON do Flow
- Alteração requer mudança em múltiplos lugares

#### ❌ Quando NÃO hardcodar:

**1. Credenciais:**
```javascript
const API_KEY = process.env.API_KEY;  // ✅ Variável de ambiente
// const API_KEY = "abc123";  // ❌ NUNCA!
```

**2. URLs de API:**
```javascript
const BASE_URL = process.env.API_BASE_URL || 'https://api.example.com';
// Permite trocar entre dev/prod
```

**3. Limites configuráveis:**
```javascript
const MAX_RETRY = parseInt(process.env.MAX_RETRY || '3');
// Pode ajustar sem rebuild
```

#### 🎯 Regra geral:
**Hardcode = OK se for lógica de negócio estável. Environment Variable = melhor se for config técnica ou sensível.**

---

## 📝 CHANGELOG

### v1.0 - 02/12/2025
- ✅ Sistema completo implementado
- ✅ 4 marcas suportadas (241 modelos, 332 dispositivos)
- ✅ Criptografia RSA-2048 + AES-128-GCM
- ✅ 6 telas do Flow (DEVICE_SELECTION → SUCCESS)
- ✅ Validações completas (CPF, IMEI, Email, Idade)
- ✅ Debug ativo no webhook (signature validation bypassada)
- ✅ Deploy em produção no Vercel
- ✅ 16 lições aprendidas documentadas

---

## ⚡ QUICK START

```bash
# 1. Clone o repositório
git clone https://github.com/mvducatti/Projetos.git
cd VendasSeguroCelular

# 2. Instale dependências
npm install

# 3. Configure .env (copie .env.example)
cp .env.example .env
# Edite .env com seus dados

# 4. Teste localmente
vercel dev

# 5. Deploy
vercel --prod

# 6. Configure variáveis no Vercel Dashboard
# Settings → Environment Variables → Adicione todas do .env

# 7. Configure webhook no WhatsApp Manager
# URL: https://seu-dominio.vercel.app/api/webhook
# Verify Token: o mesmo do .env

# 8. Publique o Flow no WhatsApp Manager

# 9. Teste enviando mensagem: "quero proteger meu celular"
```

---

**🎉 Sistema pronto para uso! Boa sorte nas vendas! 🎉**
