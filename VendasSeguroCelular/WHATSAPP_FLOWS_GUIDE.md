# Guia Completo: WhatsApp Flows API v3.0

## 📚 Índice
1. [Limitações Críticas](#limitações-críticas)
2. [Interpolação de Variáveis](#interpolação-de-variáveis)
3. [Estrutura de Dados](#estrutura-de-dados)
4. [Navegação entre Telas](#navegação-entre-telas)
5. [Validações](#validações)
6. [Componentes e Propriedades](#componentes-e-propriedades)
7. [Boas Práticas](#boas-práticas)
8. [Padrões de Implementação](#padrões-de-implementação)
9. [Debugging](#debugging)

---

## 🚨 Limitações Críticas

### 1. Variáveis NÃO funcionam em propriedades de texto
```json
❌ NÃO FUNCIONA:
{
  "type": "TextBody",
  "text": "${data.variable}"
}

❌ NÃO FUNCIONA:
{
  "type": "TextHeading",
  "text": "Olá ${data.name}"
}

❌ NÃO FUNCIONA:
{
  "type": "TextCaption",
  "text": "${data.description}"
}
```

**MOTIVO:** WhatsApp Flows v3.0 não suporta interpolação de variáveis em componentes de texto estáticos.

### 2. Onde as variáveis FUNCIONAM

```json
✅ FUNCIONA - init-value:
{
  "type": "TextInput",
  "name": "email",
  "init-value": "${data.user_email}"
}

✅ FUNCIONA - data-source:
{
  "type": "Dropdown",
  "name": "brand",
  "data-source": "${data.brands}"
}

✅ FUNCIONA - RadioButtonsGroup com data-source:
{
  "type": "RadioButtonsGroup",
  "name": "price",
  "data-source": "${data.price_display}",
  "init-value": "price"
}

✅ FUNCIONA - error-message:
{
  "type": "TextInput",
  "name": "cpf",
  "error-message": "${data.cpf_error}"
}

✅ FUNCIONA - helper-text:
{
  "type": "TextInput",
  "name": "phone",
  "helper-text": "${data.phone_helper}"
}
```

---

## 🔄 Interpolação de Variáveis

### Referências entre Telas

```json
✅ Acessar dados de outra tela:
{
  "payload": {
    "device_id": "${screen.DEVICE_SELECTION.data.device_id}",
    "plan": "${screen.PLAN_SELECTION.form.plan}"
  }
}
```

**Padrão:**
- `${screen.SCREEN_ID.data.field}` - para dados vindos do endpoint
- `${screen.SCREEN_ID.form.field}` - para valores de formulário (inputs, dropdowns, etc)

### Tipos de Referências

```json
${data.field}              // Dados da tela atual
${form.field}              // Valores do formulário atual
${screen.SCREEN_ID.data.x} // Dados de outra tela
${screen.SCREEN_ID.form.y} // Formulário de outra tela
```

---

## 📊 Estrutura de Dados

### Schema Correto

```json
{
  "data": {
    "brands": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {"type": "string"},
          "title": {"type": "string"}
        }
      },
      "__example__": [
        {"id": "APPLE", "title": "Apple"}
      ]
    },
    "error_message": {
      "type": "string",
      "__example__": ""
    },
    "device_id": {
      "type": "string",
      "__example__": "123"
    }
  }
}
```

**IMPORTANTE:**
- Sempre inclua `__example__` para cada campo
- Arrays devem ter `items` com estrutura completa
- Strings vazias devem ter `__example__: ""`

---

## 🧭 Navegação entre Telas

### Método 1: Navigate (Simples)

```json
{
  "type": "Footer",
  "label": "Continuar",
  "on-click-action": {
    "name": "navigate",
    "next": {
      "type": "screen",
      "name": "NEXT_SCREEN"
    },
    "payload": {}
  }
}
```

**Quando usar:** Navegação simples sem precisar validar ou processar dados.

### Método 2: Data Exchange + Navigate (Com Validação)

```json
// No whatsappflow.json
{
  "type": "Footer",
  "label": "Validar e Continuar",
  "on-click-action": {
    "name": "data_exchange",
    "payload": {
      "cpf": "${form.cpf}",
      "validate_cpf": true
    }
  }
}
```

```javascript
// No endpoint
if (requestData.validate_cpf) {
  if (cpfValid) {
    return sendEncryptedResponse({
      screen: 'NEXT_SCREEN',
      data: { /* dados para próxima tela */ }
    });
  } else {
    return sendEncryptedResponse({
      screen: 'CURRENT_SCREEN',
      data: {
        cpf_error: 'CPF inválido'
      }
    });
  }
}
```

**Quando usar:** Quando precisa validar dados antes de navegar.

### Método 3: Data Exchange com navigate_to

```json
{
  "payload": {
    "device_id": "${data.device_id}",
    "navigate_to": "PLAN_SELECTION"
  }
}
```

```javascript
if (requestData.navigate_to === 'PLAN_SELECTION') {
  return sendEncryptedResponse({
    screen: 'PLAN_SELECTION',
    data: { /* dados */ }
  });
}
```

---

## ✅ Validações

### Validação de CPF com Checksum

```javascript
function validateCPF(cpf) {
  // Remove formatação
  const cpfClean = cpf.replace(/\D/g, '');
  
  if (cpfClean.length !== 11) return false;
  
  // Rejeita CPFs com todos dígitos iguais
  if (/^(\d)\1{10}$/.test(cpfClean)) return false;
  
  // Valida primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpfClean[i]) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 >= 10) digit1 = 0;
  
  // Valida segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpfClean[i]) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 >= 10) digit2 = 0;
  
  return digit1 === parseInt(cpfClean[9]) && digit2 === parseInt(cpfClean[10]);
}
```

### Validação de Telefone

```javascript
const phoneClean = phone.replace(/\D/g, '');
if (phoneClean.length !== 10 && phoneClean.length !== 11) {
  return 'Telefone inválido. Deve conter 10 ou 11 dígitos.';
}
```

### Validação de IMEI (15 dígitos)

```javascript
const imeiClean = imei.replace(/\D/g, '');
if (imeiClean.length !== 15) {
  return 'IMEI inválido. Deve conter 15 dígitos.';
}
```

### Validação de Idade (18+)

```javascript
const birthDate = new Date(birth_date);
const today = new Date();
let age = today.getFullYear() - birthDate.getFullYear();
const monthDiff = today.getMonth() - birthDate.getMonth();

if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
  age--;
}

if (age < 18) {
  return 'Você deve ter pelo menos 18 anos.';
}
```

---

## 🎨 Componentes e Propriedades

### Propriedades NÃO Suportadas

```json
❌ "input-text-transform": "lowercase"  // NÃO EXISTE
❌ "on-initial-load": {}                 // NÃO SUPORTADO
❌ "visible": "${data.is_loaded}"        // Funciona mas evite em terminal screens
```

### If Component - Estrutura Correta

```json
❌ ERRADO:
{
  "type": "If",
  "condition": "${data.show}",
  "then": {                    // ❌ Object
    "type": "TextBody",
    "text": "Texto"
  }
}

✅ CORRETO:
{
  "type": "If",
  "condition": "${data.show}",
  "then": [                    // ✅ Array
    {
      "type": "TextBody",
      "text": "Texto"
    }
  ]
}
```

### RadioButtonsGroup - Uso Dinâmico

```json
// Perfeito para exibir variáveis dinâmicas
{
  "type": "RadioButtonsGroup",
  "name": "price_display",
  "label": "Valor Final",
  "required": true,
  "data-source": "${data.price_options}",
  "init-value": "price"
}
```

```javascript
// No endpoint, retorne:
return {
  price_options: [
    {
      id: "price",
      title: `Mensalidade de R$ ${finalPrice.toFixed(2)}`,
      description: "Plano SUPER ECONÔMICO"
    }
  ]
};
```

---

## 🏆 Boas Práticas

### 1. Estruturação de Código

```javascript
// ✅ BOM: Funções auxiliares reutilizáveis
function sendEncryptedResponse(responseData) {
  const encryptedData = encryptResponse(responseData, aesKey, iv);
  return new Response(JSON.stringify(encryptedData), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// ✅ BOM: Logs estruturados
console.log('📋 Order summary:', {
  client: full_name,
  device: deviceId,
  plan: selectedPlan
});

// ✅ BOM: Validação centralizada
const errors = validateClientData(cpf, phone, birth_date);
if (errors.length > 0) {
  return sendEncryptedResponse({
    screen: 'CLIENT_DATA',
    data: { errors }
  });
}
```

### 2. Nomenclatura

```javascript
// ✅ BOM: Nomes descritivos
const franchiseMultiplier = franchise === 'reduzida' ? 1.15 : 1.0;
const formattedCpf = cpfClean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

// ❌ RUIM: Nomes genéricos
const mult = 1.15;
const str = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
```

### 3. Formatação de Dados

```javascript
// CPF: 123.456.789-00
const formattedCpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

// Telefone: (11) 98765-4321
const formattedPhone = phone.length === 11 
  ? phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  : phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');

// Email: sempre lowercase
const formattedEmail = email.toLowerCase();

// Preço: R$ 49,90
const formattedPrice = `R$ ${price.toFixed(2)}`;
```

### 4. Tratamento de Erros

```javascript
// ✅ BOM: Retornar erros específicos
if (!cpfValid) {
  return sendEncryptedResponse({
    screen: 'CLIENT_DATA',
    data: {
      cpf_error: 'CPF inválido. Verifique os números digitados.'
    }
  });
}

// ✅ BOM: Múltiplos erros
return sendEncryptedResponse({
  screen: 'CLIENT_DATA',
  data: {
    cpf_error: cpfError || '',
    phone_error: phoneError || '',
    birth_date_error: birthDateError || ''
  }
});
```

---

## 🔧 Padrões de Implementação

### Padrão 1: Dropdowns Encadeados

```json
// 1º Dropdown
{
  "type": "Dropdown",
  "name": "brand",
  "data-source": "${data.brands}",
  "on-select-action": {
    "name": "data_exchange",
    "payload": {
      "selected_brand": "${form.brand}"
    }
  }
}

// 2º Dropdown (depende do 1º)
{
  "type": "Dropdown",
  "name": "model",
  "data-source": "${data.models}",
  "on-select-action": {
    "name": "data_exchange",
    "payload": {
      "selected_brand": "${form.brand}",
      "selected_model": "${form.model}"
    }
  }
}
```

```javascript
// Endpoint handler
if (requestData.selected_brand) {
  const models = await getModels(requestData.selected_brand);
  return sendEncryptedResponse({
    screen: 'DEVICE_SELECTION',
    data: {
      brands: brands,
      models: models,
      memories: []
    }
  });
}
```

### Padrão 2: Preço Dinâmico

```javascript
// Calcular preço com múltiplos modificadores
const basePrices = {
  'super_economico': { mensal: 19.90, anual: 215.00 },
  'economico': { mensal: 34.90, anual: 383.00 },
  'completo': { mensal: 49.90, anual: 539.00 }
};

const franchiseMultiplier = franchise === 'reduzida' ? 1.15 : 1.0;
const monthlyPrice = basePrices[plan].mensal * franchiseMultiplier;
const annualPrice = basePrices[plan].anual * franchiseMultiplier;

const finalPrice = billing_type === 'mensal' ? monthlyPrice : annualPrice;

// Texto dinâmico baseado em condição
const priceText = billing_type === 'mensal'
  ? `Mensalidade de R$ ${finalPrice.toFixed(2)}`
  : `11x de R$ ${Math.ceil(annualPrice / 11).toFixed(2)} sem juros`;

return {
  price_display: [
    {
      id: "price",
      title: priceText,
      description: planNames[plan]
    }
  ]
};
```

### Padrão 3: Tela Terminal com Dados Dinâmicos

**PROBLEMA:** Telas `terminal: true` não podem exibir variáveis dinamicamente porque os dados são passados apenas na navegação.

**SOLUÇÃO:** Usar Map temporário + Data Exchange

```javascript
// 1. Salvar dados em Map
const orderDataStore = new Map();

const orderSummary = {
  client_name: full_name,
  device: deviceModel,
  total: finalPrice
};

orderDataStore.set(flow_token, orderSummary);

// 2. Navegar com ID
return sendEncryptedResponse({
  screen: 'ORDER_SUMMARY',
  data: {
    order_id: flow_token
  }
});
```

```json
// 3. Botão para carregar dados
{
  "type": "EmbeddedLink",
  "text": "🔄 Carregar Dados",
  "on-click-action": {
    "name": "data_exchange",
    "payload": {
      "order_id": "${data.order_id}",
      "load_summary": true
    }
  }
}
```

```javascript
// 4. Handler para carregar
if (requestData.load_summary) {
  const summary = orderDataStore.get(requestData.order_id);
  
  return sendEncryptedResponse({
    screen: 'ORDER_SUMMARY',
    data: {
      order_id: requestData.order_id,
      ...summary
    }
  });
}
```

---

## 🐛 Debugging

### Logs Essenciais

```javascript
// Início do request
console.log('========================================');
console.log('🔵 FLOW ENDPOINT CALLED at', new Date().toISOString());
console.log('📍 Action:', action);
console.log('📍 Screen:', screen);

// Dados recebidos
console.log('📊 Request data:', JSON.stringify(requestData));
console.log('🔍 Request data keys:', Object.keys(requestData));

// Valores extraídos
console.log('🔎 Extracted values:', {
  cpf: cpf || 'UNDEFINED',
  full_name: full_name || 'UNDEFINED'
});

// Dados calculados
console.log('💰 Price calculation:', {
  basePrices,
  franchiseMultiplier,
  finalPrice
});

// Dados sendo enviados
console.log('📤 Sending to screen:', screen);
console.log('📦 Response data:', JSON.stringify(responseData, null, 2));
```

### Checklist de Troubleshooting

**Variáveis não aparecem:**
- [ ] A variável está sendo usada em TextBody/TextHeading? (não funciona)
- [ ] A variável está em init-value ou data-source? (funciona)
- [ ] O campo existe no schema `data:`?
- [ ] O campo foi retornado pelo endpoint?

**Navegação não funciona:**
- [ ] O screen está no `routing_model`?
- [ ] O `navigate_to` ou `screen` está correto?
- [ ] O endpoint está retornando `screen: 'SCREEN_NAME'`?

**Dados não chegam no endpoint:**
- [ ] O campo está no payload do `data_exchange`?
- [ ] O nome do campo no payload corresponde ao `name` do input?
- [ ] Está usando `${form.field}` ou `${data.field}` corretamente?

**Validação não funciona:**
- [ ] O `error-message` está vinculado a `${data.error_field}`?
- [ ] O endpoint está retornando para a mesma screen com o erro?
- [ ] O campo de erro existe no schema?

---

## 📝 Template Completo

### whatsappflow.json

```json
{
  "version": "7.2",
  "data_api_version": "3.0",
  "routing_model": {
    "SCREEN_1": ["SCREEN_2"],
    "SCREEN_2": ["SCREEN_3"]
  },
  "screens": [
    {
      "id": "SCREEN_1",
      "title": "Título",
      "data": {
        "field1": {
          "type": "string",
          "__example__": ""
        },
        "items": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": {"type": "string"},
              "title": {"type": "string"}
            }
          },
          "__example__": []
        },
        "error_message": {
          "type": "string",
          "__example__": ""
        }
      },
      "layout": {
        "type": "SingleColumnLayout",
        "children": [
          {
            "type": "TextHeading",
            "text": "Cabeçalho"
          },
          {
            "type": "TextInput",
            "name": "input1",
            "label": "Campo",
            "required": true,
            "error-message": "${data.error_message}"
          },
          {
            "type": "Footer",
            "label": "Continuar",
            "on-click-action": {
              "name": "data_exchange",
              "payload": {
                "input1": "${form.input1}",
                "validate": true
              }
            }
          }
        ]
      }
    }
  ]
}
```

### Endpoint Handler

```javascript
import crypto from 'crypto';

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const dataStore = new Map();

function decryptRequest(encryptedFlowData, encryptedAesKey, initialVector) {
  const decryptedAesKey = crypto.privateDecrypt(
    {
      key: PRIVATE_KEY,
      oaepHash: 'sha256',
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    Buffer.from(encryptedAesKey, 'base64')
  );

  const ivBuffer = Buffer.from(initialVector, 'base64');
  const encryptedBuffer = Buffer.from(encryptedFlowData, 'base64');
  
  const authTag = encryptedBuffer.slice(-16);
  const encryptedData = encryptedBuffer.slice(0, -16);

  const decipher = crypto.createDecipheriv('aes-128-gcm', decryptedAesKey, ivBuffer);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedData, null, 'utf8');
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted);
}

function encryptResponse(response, aesKey, iv) {
  const flippedIv = Buffer.from(iv);
  for (let i = 0; i < flippedIv.length; i++) {
    flippedIv[i] ^= 0xFF;
  }

  const cipher = crypto.createCipheriv('aes-128-gcm', aesKey, flippedIv);
  
  let encrypted = cipher.update(JSON.stringify(response), 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const authTag = cipher.getAuthTag();
  const encryptedWithTag = Buffer.concat([
    Buffer.from(encrypted, 'base64'),
    authTag
  ]).toString('base64');

  return { encrypted_flow_data: encryptedWithTag };
}

function sendEncryptedResponse(responseData, aesKey, iv) {
  const encryptedData = encryptResponse(responseData, aesKey, iv);
  return new Response(JSON.stringify(encryptedData), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export default async function handler(req) {
  try {
    const { encrypted_flow_data, encrypted_aes_key, initial_vector } = await req.json();
    
    const decrypted = decryptRequest(encrypted_flow_data, encrypted_aes_key, initial_vector);
    const { screen, action, data: requestData, flow_token } = decrypted;
    
    const aesKey = crypto.privateDecrypt(
      {
        key: PRIVATE_KEY,
        oaepHash: 'sha256',
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      Buffer.from(encrypted_aes_key, 'base64')
    );
    const iv = Buffer.from(initial_vector, 'base64');
    
    console.log('📍 Screen:', screen, 'Action:', action);
    console.log('📊 Request data:', JSON.stringify(requestData));
    
    // INIT
    if (action === 'INIT') {
      return sendEncryptedResponse({
        screen: 'SCREEN_1',
        data: {
          field1: '',
          items: [],
          error_message: ''
        }
      }, aesKey, iv);
    }
    
    // DATA EXCHANGE
    if (action === 'data_exchange') {
      if (screen === 'SCREEN_1') {
        if (requestData.validate) {
          const error = validateInput(requestData.input1);
          
          if (error) {
            return sendEncryptedResponse({
              screen: 'SCREEN_1',
              data: {
                error_message: error
              }
            }, aesKey, iv);
          }
          
          return sendEncryptedResponse({
            screen: 'SCREEN_2',
            data: { /* dados */ }
          }, aesKey, iv);
        }
      }
    }
    
    throw new Error('Unhandled screen or action');
    
  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

---

## 🎨 Formatação de Texto em Terminal Screens

### ✅ DESCOBERTA CRÍTICA: Terminal Screens e Variáveis Múltiplas

**PROBLEMA:** Telas terminal (`"terminal": true`) NÃO processam corretamente múltiplas variáveis `${data.field}` em componentes TextBody separados.

**CAUSA:** Terminal screens recebem dados apenas UMA VEZ na navegação e não suportam data_exchange posterior. O WhatsApp Flows não consegue interpolar múltiplas variáveis dinamicamente nessas telas.

**SOLUÇÃO:** Enviar TODO o texto formatado em UMA ÚNICA variável!

```json
❌ NÃO FUNCIONA em Terminal Screens:
{
  "layout": {
    "children": [
      {
        "type": "TextBody",
        "text": "Nome: ${data.client_name}"
      },
      {
        "type": "TextBody",
        "text": "CPF: ${data.client_cpf}"
      },
      {
        "type": "TextBody",
        "text": "Email: ${data.client_email}"
      }
    ]
  }
}

✅ FUNCIONA - Uma única variável com todo o texto:
{
  "data": {
    "summary_text": {
      "type": "string",
      "__example__": "Nome: João Silva\nCPF: 123.456.789-00\nEmail: joao@email.com"
    }
  },
  "layout": {
    "children": [
      {
        "type": "TextBody",
        "text": "${data.summary_text}"
      }
    ]
  }
}
```

### Backend - Construção do Texto Completo

```javascript
// Backend deve montar TODO o texto em UMA variável
const summaryText = `*RESUMO DO PEDIDO*

*DADOS DO CLIENTE*
Nome: *${full_name}*
CPF: ${formattedCpf}
Email: ${formattedEmail}
Telefone: ${formattedPhone}
Data de Nascimento: ${birth_date}

*DADOS DO APARELHO*
Dispositivo: *${device.DeModel} - ${device.DeMemory}*

*PLANO CONTRATADO*
Plano: *${planNames[selectedPlan]}*
Franquia: ${franchiseLabel}
Forma de Cobrança: ${billingLabel}

*VALOR FINAL*
*${totalDisplay}*`;

return sendEncryptedResponse({
  screen: 'ORDER_SUMMARY',
  data: {
    order_id: flow_token,
    summary_text: summaryText  // ✅ UMA única variável
  }
});
```

### Markdown Suportado

WhatsApp Flows suporta formatação Markdown básica:

```javascript
// ✅ Negrito
"*texto em negrito*"

// ✅ Itálico
"_texto em itálico_"

// ✅ Riscado
"~texto riscado~"

// ✅ Monospace/Código
"`código`"
"```bloco de código```"

// ✅ Quebra de linha
"Linha 1\nLinha 2"

// ✅ Combinações
"*Negrito* com _itálico_ e `código`"
```

### Exemplo Prático

```javascript
// Backend formatado com Markdown
const summaryText = `*🎉 PEDIDO CONFIRMADO*

*Cliente:* ${full_name}
_CPF:_ ${formattedCpf}
_Email:_ ${formattedEmail}

*📱 Aparelho*
${device.model} - ${device.memory}
~Preço original: R$ 5.000,00~
*Valor do seguro:* R$ ${insurancePrice}

\`Código do Pedido: ${orderId}\`

_Você receberá um email com a apólice em até 24h._`;

return {
  screen: 'ORDER_SUMMARY',
  data: {
    summary_text: summaryText
  }
};
```

### Resultado Visual

```
🎉 PEDIDO CONFIRMADO

Cliente: João Silva
CPF: 123.456.789-00
Email: joao@email.com

📱 Aparelho
iPhone 15 Pro - 256GB
Preço original: R$ 5.000,00
Valor do seguro: R$ 49.90

Código do Pedido: ABC123XYZ

Você receberá um email com a apólice em até 24h.
```

### ⚠️ Limitações

1. **Emojis:** Funcionam, mas podem não renderizar em todos dispositivos
2. **Links:** Use componente `EmbeddedLink` separado, não dentro do texto
3. **Imagens:** Não suportadas em TextBody
4. **Listas numeradas:** Use numeração manual (1. 2. 3.)
5. **HTML:** Não suportado, apenas Markdown básico

---

## 🎯 Resumo das Regras de Ouro

1. **Variáveis NÃO funcionam em TextBody, TextHeading, TextCaption**
2. **Terminal screens: UMA ÚNICA variável com TODO o texto formatado**
3. **Use Markdown para formatar texto (*negrito*, _itálico_, ~riscado~, `código`)**
4. **Use RadioButtonsGroup com data-source para exibir texto dinâmico em telas normais**
5. **Sempre retorne campos de erro vazios mesmo quando não há erro**
6. **Use Map/Database para persistir dados entre screens**
7. **Logs detalhados são essenciais para debugging**
8. **Valide no backend, não confie no frontend**
9. **Formate dados antes de exibir (CPF, telefone, preço)**
10. **`then` e `else` do If component são ARRAYS, não objects**
11. **Prefira data_exchange com navegação a navigate simples quando precisar validar**

---

## 📞 Suporte

Para dúvidas específicas ou casos não cobertos neste guia, consulte:
- [Documentação Oficial WhatsApp Flows](https://developers.facebook.com/docs/whatsapp/flows)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp/business-management-api)

---

**Versão do Guia:** 1.0  
**Última Atualização:** Dezembro 2025  
**API Version:** WhatsApp Flows v3.0
