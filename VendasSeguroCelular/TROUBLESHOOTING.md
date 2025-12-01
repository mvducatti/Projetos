# 🔴 ANÁLISE COMPLETA DO ERRO "Something Went Wrong"

## ✅ Correções Implementadas

### 1. **Adicionado tratamento para ação `INIT`**
**Problema:** Quando o usuário abre o Flow pela primeira vez, o WhatsApp envia `action: "INIT"`. O código anterior NÃO tratava isso, causando o erro "Something went wrong".

**Solução:** Adicionado handler específico:
```javascript
if (action === 'INIT') {
  console.log('🚀 INIT action - Loading first screen');
  const brands = await getBrands();
  
  const initResponse = {
    screen: 'DEVICE_SELECTION',
    data: {
      brands: brands,
      models: [],
      memories: [],
      // ... demais campos
    }
  };
  
  return res.status(200).send(encryptedInitResponse);
}
```

### 2. **Adicionado tratamento de erros do cliente**
**Problema:** WhatsApp envia notificações de erro via `data.error`. Sem tratamento, o endpoint não respondia corretamente.

**Solução:**
```javascript
if (requestData?.error) {
  console.warn('⚠️ Client error received:', requestData.error);
  const errorAck = {
    data: { acknowledged: true }
  };
  return res.status(200).send(encryptedAck);
}
```

### 3. **Corrigido formato de resposta para data_exchange**
**Problema:** Respostas devem ter estrutura `{screen, data}` sempre.

**Solução:** Agora todas as respostas seguem o formato correto:
```javascript
responseData = {
  screen: 'DEVICE_SELECTION',
  data: {
    models: models,
    memories: []
  }
};
```

### 4. **Adicionado retorno HTTP 421 para erros de descriptografia**
**Problema:** Quando a descriptografia falha (chave incorreta), deve retornar 421 para que o WhatsApp atualize as chaves.

**Solução:**
```javascript
if (error.message.includes('Decryption failed')) {
  console.error('🔑 Decryption error - returning 421 to refresh keys');
  return res.status(421).send();
}
```

### 5. **Separação clara entre INIT e data_exchange**
**Problema:** INIT é para carregar tela inicial, data_exchange é para interações subsequentes.

**Solução:** Handlers separados para cada ação.

---

## 🔍 Próximos Passos de Debugging

### Passo 1: Verificar Variável de Ambiente PRIVATE_KEY no Vercel
```bash
# Acessar: https://vercel.com/smartprojects-projects/whatsapp-flow/settings/environment-variables

# Verificar se PRIVATE_KEY contém:
-----BEGIN PRIVATE KEY-----
MIIE...
-----END PRIVATE KEY-----

# IMPORTANTE: Deve incluir as linhas BEGIN/END e quebras de linha corretas
```

### Passo 2: Verificar Public Key no WhatsApp Business Manager
1. Acessar Flow Manager no WhatsApp Business
2. Abrir o Flow criado
3. Ir em "Endpoint" settings
4. Verificar se a chave pública corresponde à chave privada no Vercel

### Passo 3: Testar com Logs em Tempo Real
Após deploy:
```bash
vercel --prod
```

Abrir logs do Vercel:
```
https://vercel.com/smartprojects-projects/whatsapp-flow/logs
```

Testar o Flow no WhatsApp e observar:
- Se o log "🔵 FLOW ENDPOINT CALLED" aparece (prova que request chegou)
- Se "🚀 INIT action" aparece (prova que INIT foi detectado)
- Se há erros de descriptografia
- Qual a resposta enviada

### Passo 4: Verificar Endpoint URI no Flow Manager
Confirmar que o endpoint está configurado como:
```
https://whatsapp-flow-beige.vercel.app/api/flow
```

NÃO pode ter `/healthcheck` ou qualquer outro sufixo.

---

## 🐛 Possíveis Causas Restantes (se ainda não funcionar)

### Causa 1: Chave Privada Incorreta no Vercel
**Como verificar:**
1. Copiar conteúdo de `private.key`
2. Verificar se começa com `-----BEGIN PRIVATE KEY-----`
3. Verificar se tem quebras de linha (`\n`) ou é uma linha única
4. No Vercel, a variável deve manter as quebras de linha

**Como corrigir:**
- No Vercel Dashboard, editar PRIVATE_KEY
- Colar o conteúdo exato do arquivo `private.key` (com quebras de linha)
- Salvar e redeployar

### Causa 2: Chave Pública não corresponde à Privada
**Como verificar:**
```bash
# No diretório do projeto, rodar:
node -e "const crypto = require('crypto'); const fs = require('fs'); const priv = fs.readFileSync('private.key'); const pub = fs.readFileSync('public.key'); console.log('Keys match:', crypto.createPrivateKey(priv).export({type:'spki',format:'pem'}) === pub.toString());"
```

Se retornar `false`, precisa regenerar as chaves:
```bash
node generate-keys.js
```

E atualizar:
- `private.key` no Vercel (variável PRIVATE_KEY)
- `public.key` no WhatsApp Flow Manager

### Causa 3: Flow JSON com problemas
**Verificar:**
1. Acessar WhatsApp Flow Manager
2. Abrir o Flow
3. Clicar em "Publish" para validar
4. Se houver erros de schema, corrigir no `whatsappflow.json`

### Causa 4: Timeout do Vercel
Serverless functions no Vercel têm timeout de 10 segundos (Free tier).

**Como verificar:**
Adicionar métricas de tempo no código:
```javascript
const startTime = Date.now();
// ... código ...
console.log(`⏱️ Processing took ${Date.now() - startTime}ms`);
```

Se > 10000ms, otimizar:
- Remover chamadas desnecessárias
- Cachear dados estáticos
- Reduzir tamanho da resposta

### Causa 5: CORS ou Headers incorretos
Vercel pode estar bloqueando requisições do WhatsApp.

**Solução:** Adicionar configuração no `vercel.json`:
```json
{
  "version": 2,
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "POST, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, X-Hub-Signature-256" }
      ]
    }
  ]
}
```

---

## 📋 Checklist de Verificação

Execute esta checklist em ordem:

- [ ] **Vercel:** PRIVATE_KEY existe e está correta (com BEGIN/END e quebras de linha)
- [ ] **WhatsApp:** Public key corresponde à private key
- [ ] **Endpoint URI:** Configurado como `/api/flow` (sem `/healthcheck`)
- [ ] **Health Check:** Funciona (já confirmado pelo usuário ✅)
- [ ] **Logs Vercel:** Aparecem quando testa Flow no WhatsApp
- [ ] **Flow JSON:** Validado e publicado sem erros
- [ ] **Action INIT:** Logs mostram "🚀 INIT action" quando abre Flow
- [ ] **Descriptografia:** Logs mostram "✅ Decryption successful!"
- [ ] **Resposta:** Logs mostram "📤 INIT response" com brands array

---

## 🔬 Teste Local (Opcional)

Para testar localmente sem WhatsApp:

1. Criar arquivo `test-flow.js`:
```javascript
import crypto from 'crypto';
import fs from 'fs';

const PRIVATE_KEY = fs.readFileSync('private.key', 'utf8');
const PUBLIC_KEY = fs.readFileSync('public.key', 'utf8');

// Simular request do WhatsApp
const aesKey = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);

const requestBody = {
  version: '3.0',
  action: 'INIT'
};

// Encrypt
const cipher = crypto.createCipheriv('aes-128-gcm', aesKey, iv);
let encrypted = cipher.update(JSON.stringify(requestBody), 'utf8');
encrypted = Buffer.concat([encrypted, cipher.final(), cipher.getAuthTag()]);

const encryptedAesKey = crypto.publicEncrypt(
  {
    key: PUBLIC_KEY,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha256'
  },
  aesKey
);

const payload = {
  encrypted_flow_data: encrypted.toString('base64'),
  encrypted_aes_key: encryptedAesKey.toString('base64'),
  initial_vector: iv.toString('base64')
};

console.log('Test payload:');
console.log(JSON.stringify(payload, null, 2));

// Enviar para localhost:3000/api/flow via POST
```

2. Rodar local server:
```bash
npm run dev
```

3. Rodar teste:
```bash
node test-flow.js
```

4. Enviar payload para `http://localhost:3000/api/flow` via Postman/curl

---

## 📞 Comandos Úteis

### Ver logs em tempo real:
```bash
vercel logs whatsapp-flow --follow
```

### Redeployar após mudanças:
```bash
vercel --prod
```

### Ver todas as variáveis de ambiente:
```bash
vercel env ls
```

### Adicionar PRIVATE_KEY via CLI (se necessário):
```bash
vercel env add PRIVATE_KEY
# Colar conteúdo do arquivo private.key quando solicitado
# Selecionar: Production
```

---

## 🎯 Expectativa de Sucesso

Após as correções implementadas, quando testar no WhatsApp:

1. **Logs devem mostrar:**
```
🔵 FLOW ENDPOINT CALLED at 2024-XX-XX...
🔐 Attempting decryption...
✅ Decryption successful!
🚀 INIT action - Loading first screen
📤 INIT response: {"screen":"DEVICE_SELECTION","data":{...}}
✅ INIT response encrypted and sent
```

2. **WhatsApp deve mostrar:**
- Tela "Dados do Aparelho"
- Dropdown "Marca do Celular" com opções "Apple" e "Samsung"
- Outros dropdowns desabilitados (aguardando seleção da marca)

3. **Ao selecionar marca:**
```
🔄 DATA EXCHANGE - Screen: DEVICE_SELECTION
📊 Request data: {"selected_brand":"APPLE"}
📤 DATA EXCHANGE response: {"screen":"DEVICE_SELECTION","data":{"models":[...]}}
✅ Response encrypted successfully
```

4. **WhatsApp deve atualizar:**
- Dropdown "Modelo" agora habilitado com modelos da Apple

---

## 🚨 Se Ainda Não Funcionar

Se após todas as correções ainda mostrar "Something went wrong":

1. **Verificar logs do Vercel** - Se não aparecem logs, problema é ANTES do endpoint
2. **Verificar configuração do endpoint no WhatsApp** - URI incorreto
3. **Verificar chaves** - Public/private não correspondem
4. **Verificar Flow JSON** - Pode ter erro de schema não detectado
5. **Verificar certificado SSL** - Vercel deve ter SSL válido automaticamente
6. **Verificar rate limiting** - WhatsApp pode estar bloqueando por muitas tentativas

Entre em contato fornecendo:
- Screenshot dos logs do Vercel durante o teste
- Screenshot da configuração do endpoint no WhatsApp Flow Manager
- Conteúdo da variável PRIVATE_KEY (primeiras/últimas 50 caracteres apenas)
