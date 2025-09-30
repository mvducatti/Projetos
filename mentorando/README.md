# Mentorando - Plataforma de Mentoria

Uma plataforma moderna e responsiva para conectar mentores e mentorandos, facilitando o agendamento de sessões de mentoria por vídeo.

## 🚀 Tecnologias

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Autenticação**: NextAuth.js (Google + LinkedIn)
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Hosting**: Vercel (recomendado)
- **Design**: Mobile-first, totalmente responsivo

## 📱 Características

- **Mobile First**: Interface otimizada para dispositivos móveis
- **Responsivo**: Funciona perfeitamente em tablets e desktops
- **Login Social**: Integração com Google e LinkedIn
- **Sessão Persistente**: Login automático ao retornar
- **Modern UI**: Interface limpa e intuitiva

## 🛠️ Configuração do Projeto

### Pré-requisitos

- Node.js 18+
- PostgreSQL (ou use Neon.tech para gratuito)

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` com:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=seu-secret-super-seguro-aqui

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mentorando?schema=public"
```

### 3. Configurar OAuth

#### Google OAuth:
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione existente
3. Ative a Google+ API
4. Crie credenciais OAuth 2.0
5. Configure URLs de redirecionamento: `http://localhost:3000/api/auth/callback/google`

#### LinkedIn OAuth:
1. Acesse [LinkedIn Developer](https://www.linkedin.com/developers/)
2. Crie uma nova aplicação
3. Configure redirect URL: `http://localhost:3000/api/auth/callback/linkedin`

### 4. Configurar Banco de Dados

```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrations
npx prisma db push

# (Opcional) Visualizar banco
npx prisma studio
```

### 5. Executar o Projeto

```bash
npm run dev
```

Acesse: http://localhost:3000

## 🗄️ Opções de Banco de Dados Gratuitas

### 1. Neon.tech (Recomendado)
- ✅ 512MB gratuito
- ✅ Baseado em PostgreSQL
- ✅ Fácil configuração
- ✅ Boa para desenvolvimento e produção pequena

### 2. PlanetScale
- ✅ 5GB gratuito
- ✅ Baseado em MySQL
- ✅ Branching de banco de dados

### 3. Supabase
- ✅ 500MB gratuito
- ✅ PostgreSQL + recursos extras
- ✅ Auth, Storage, Realtime

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Outras opções:
- Netlify
- Railway
- Render

## 📂 Estrutura do Projeto

```
src/
├── app/
│   ├── api/auth/[...nextauth]/     # Configuração NextAuth
│   ├── dashboard/                  # Dashboard principal
│   ├── login/                      # Tela de login
│   ├── layout.tsx                  # Layout principal
│   └── page.tsx                    # Página inicial (redirecionamento)
├── components/
│   └── providers/                  # Providers React
├── lib/
│   ├── prisma.ts                   # Cliente Prisma
│   └── utils.ts                    # Utilitários
└── types/                          # Definições TypeScript
```

## 🎨 Design System

- **Cores primárias**: Azul (#3b82f6)
- **Tipografia**: Inter
- **Componentes**: Tailwind CSS + componentes customizados
- **Ícones**: React Icons (Feather Icons)

## 🔐 Segurança

- Autenticação via OAuth (Google/LinkedIn)
- Sessões criptografadas
- Middleware de proteção de rotas
- Variáveis de ambiente para secrets

## 📱 Progressive Web App (PWA)

O projeto está configurado para funcionar como PWA:
- Instalável em dispositivos móveis
- Funciona offline (cache básico)
- Ícones e splash screens configurados

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.