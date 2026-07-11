# FitIA — Treino e dieta personalizados por IA

Web app (PWA) que monta treino e dieta personalizados usando IA, a partir das
respostas de um formulário de anamnese do usuário.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4)
- **Supabase** — autenticação (e-mail/senha) e banco de dados Postgres com Row
  Level Security
- **OpenAI** — geração dos planos de treino e dieta via saída estruturada
  (JSON Schema)
- **react-hook-form + zod** — formulário de anamnese com validação
- PWA — instalável no celular (`manifest.ts` + service worker de app shell)

## Como funciona

1. O usuário cria uma conta (`/cadastro`) e confirma o e-mail.
2. Preenche a anamnese em `/anamnese` (dados pessoais, objetivo, rotina de
   treino, saúde, alimentação e estilo de vida).
3. Ao enviar, a anamnese é salva (`POST /api/anamnese`) e a IA gera um plano
   de treino e um plano de dieta (`POST /api/gerar-plano`), salvos no banco.
4. O usuário acompanha tudo em `/dashboard` (`/dashboard/treino`,
   `/dashboard/dieta`, `/dashboard/perfil`), podendo gerar um novo plano a
   qualquer momento a partir da mesma anamnese ou refazendo o formulário.

## Configuração

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Em **SQL Editor**, rode o conteúdo de `supabase/migrations/0001_init.sql`
   para criar as tabelas (`profiles`, `anamnesis`, `workout_plans`,
   `diet_plans`) com as policies de Row Level Security.
3. Em **Project Settings > API**, copie a **Project URL** e a **anon public
   key**.
4. Em **Authentication > URL Configuration**, adicione
   `http://localhost:3000/auth/callback` (e a URL de produção equivalente)
   como Redirect URL.

### 2. OpenAI

Crie uma chave de API em
[platform.openai.com/api-keys](https://platform.openai.com/api-keys).

### 3. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
```

### 4. Rodar localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Estrutura

```
src/
  app/
    page.tsx                 landing page
    login/, cadastro/        autenticação
    auth/callback/           troca de code por sessão (Supabase)
    anamnese/                formulário multi-etapas
    dashboard/                painel (treino, dieta, perfil)
    api/anamnese/            salva a anamnese
    api/gerar-plano/         chama a IA e persiste os planos
    manifest.ts              manifest do PWA
  components/ui/             componentes base (Button, Input, Card, ...)
  components/dashboard/      nav, sign-out, regenerate plan
  lib/supabase/              clients browser/server + proxy (sessão)
  lib/ai/openai.ts           prompt + chamada estruturada à OpenAI
  lib/types.ts                schemas zod (anamnese e planos)
  proxy.ts                    protege /dashboard e /anamnese (Next.js 16)
supabase/migrations/          schema SQL
```

## Deploy

Recomendado: [Vercel](https://vercel.com/new). Configure as mesmas variáveis
de ambiente do `.env.local` no projeto da Vercel, e atualize a Redirect URL
no Supabase para o domínio de produção.

## Aviso

Os planos gerados por IA são um ponto de partida e não substituem o
acompanhamento de um profissional de educação física e de um nutricionista,
especialmente em caso de condições médicas.
