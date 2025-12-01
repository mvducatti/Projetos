# API Vendas Seguro Celular

API serverless simples pronta para deploy no Vercel.

## 📌 Endpoints Disponíveis

### GET /api/hello
Teste básico da API
```json
{
  "message": "API está funcionando!",
  "timestamp": "2025-11-30T..."
}
```

### GET /api/vendas
Lista todas as vendas
```json
{
  "vendas": [
    { "id": 1, "cliente": "João Silva", "produto": "Seguro Básico", "valor": 49.90 }
  ]
}
```

### POST /api/vendas
Cria uma nova venda
```json
// Body:
{
  "cliente": "Nome do Cliente",
  "produto": "Tipo de Seguro",
  "valor": 99.90
}

// Resposta:
{
  "success": true,
  "mensagem": "Venda registrada com sucesso",
  "venda": { ... }
}
```

## 🚀 Deploy no Vercel

### Opção 1: Via Dashboard (Mais Fácil)
1. Acesse [vercel.com](https://vercel.com)
2. Conecte seu repositório GitHub
3. Deploy automático!

### Opção 2: Via CLI
```bash
npm i -g vercel
vercel
```

## 🧪 Testar Localmente
```bash
npm i -g vercel
vercel dev
```

Acesse: http://localhost:3000/api/hello
