# FitIA — Treino e dieta personalizados por IA

Web app (PWA) que monta treino e dieta personalizados usando IA, a partir das
respostas de um formulário de anamnese do usuário. Inclui também um chat
"Nutricionista" (recurso pago via assinatura) para tirar dúvidas sobre
alimentação com base no perfil e nas refeições registradas pelo usuário.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4)
- **Supabase** — autenticação (e-mail/senha) e banco de dados Postgres com Row
  Level Security
- **OpenAI** — geração dos planos de treino/dieta (saída estruturada via JSON
  Schema) e respostas do chat Nutricionista
- **Pagar.me** — cobrança recorrente (assinatura mensal/anual) que libera o
  chat Nutricionista
- **react-hook-form + zod** — formulários com validação
- PWA — instalável no celular (`manifest.ts` + service worker de app shell)

## Como funciona

1. O usuário cria uma conta (`/cadastro`) e confirma o e-mail.
2. Preenche a anamnese em `/anamnese` (dados pessoais, objetivo, rotina de
   treino, saúde, alimentação e estilo de vida).
3. Ao enviar, a anamnese é salva (`POST /api/anamnese`) e a IA gera um plano
   de treino e um plano de dieta (`POST /api/gerar-plano`), salvos no banco.
4. O usuário acompanha tudo em `/dashboard` (`/dashboard/treino`,
   `/dashboard/dieta`, `/dashboard/refeicoes`, `/dashboard/perfil`), podendo
   gerar um novo plano a qualquer momento a partir da mesma anamnese ou
   refazendo o formulário.
5. Em `/dashboard/refeicoes` o usuário registra o que comeu. Assinando em
   `/assinar` (Pagar.me), ele libera o chat `/dashboard/nutricionista`, que
   responde com base no perfil da anamnese e nas refeições recentes.

## Chat Nutricionista

O system prompt fica em `src/lib/ai/nutricionista.ts` e segue estas regras:
responde só sobre alimentação/macros/calorias/hidratação; redireciona
perguntas de treino para um futuro chat "Personal" (ainda não implementado
neste projeto); não prescreve dietas restritivas radicais; não recomenda
suplementação sem reforçar avaliação profissional; e orienta com cuidado —
sem diagnosticar — quando identifica sinais de relação problemática com
comida.

## Assinatura (Pagar.me)

⚠️ **A documentação oficial da Pagar.me não pôde ser consultada ao vivo** ao
implementar `src/lib/payments/pagarme.ts`, `src/lib/payments/pagarme-client.ts`
e `src/app/api/webhooks/pagarme/route.ts`. A URL base (`api.pagar.me/core/v5`),
autenticação Basic Auth com a secret key, o formato do payload de assinatura e
o mecanismo de autenticação do webhook (Basic Auth configurada na própria URL
cadastrada no painel) seguem o que é documentado publicamente da API v5, mas
**confirme tudo contra a documentação atual em
[docs.pagar.me](https://docs.pagar.me) e teste em modo sandbox (chaves
`sk_test_`/`pk_test_`) antes de processar cobranças reais.**

Fluxo implementado:

1. `/assinar` — usuário escolhe plano (mensal/anual), preenche dados pessoais
   e cartão. O cartão é tokenizado **no navegador** direto com a Pagar.me
   (`NEXT_PUBLIC_PAGARME_PUBLIC_KEY`) — os dados do cartão nunca passam pelo
   nosso servidor.
2. O token vai para `POST /api/assinatura`, que usa a secret key
   (`PAGARME_SECRET_KEY`) para criar a assinatura na Pagar.me e grava o
   resultado na tabela `subscriptions` (via service role, que ignora RLS).
3. `POST /api/webhooks/pagarme` recebe atualizações assíncronas de status
   (pago, falhou, cancelado) e mantém `subscriptions.status` sincronizado.
   Cadastre essa URL no painel da Pagar.me com Basic Auth
   (`https://usuario:senha@seu-dominio.com/api/webhooks/pagarme`), usando as
   mesmas credenciais de `PAGARME_WEBHOOK_USER`/`PAGARME_WEBHOOK_PASSWORD`.
4. O chat Nutricionista (UI e API) só libera o acesso quando
   `subscriptions.status = 'active'` para o usuário.

## Configuração

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Em **SQL Editor**, rode em ordem o conteúdo de
   `supabase/migrations/0001_init.sql` (tabelas `profiles`, `anamnesis`,
   `workout_plans`, `diet_plans`) e `supabase/migrations/0002_meal_logs_subscriptions.sql`
   (tabelas `meal_logs`, `subscriptions`), ambas com policies de Row Level
   Security.
3. Em **Project Settings > API**, copie a **Project URL**, a **anon public
   key** e a **service_role key**.
4. Em **Authentication > URL Configuration**, adicione
   `http://localhost:3000/auth/callback` (e a URL de produção equivalente)
   como Redirect URL.

### 2. OpenAI

Crie uma chave de API em
[platform.openai.com/api-keys](https://platform.openai.com/api-keys).

### 3. Pagar.me

Crie uma conta em [dashboard.pagar.me](https://dashboard.pagar.me), copie a
secret key e a public key (comece pelas chaves de teste), e cadastre a URL do
webhook — veja a seção [Assinatura (Pagar.me)](#assinatura-pagarme) acima.

### 4. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha (veja os comentários em
`.env.example` para o significado de cada uma):

```bash
cp .env.example .env.local
```

### 5. Rodar localmente

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
    assinar/                 checkout da assinatura (Pagar.me)
    dashboard/                painel (treino, dieta, refeições, nutricionista, perfil)
    api/anamnese/            salva a anamnese
    api/gerar-plano/         chama a IA e persiste os planos
    api/refeicoes/           salva um registro de refeição
    api/assinatura/          cria a assinatura na Pagar.me
    api/webhooks/pagarme/    recebe atualizações de status da assinatura
    api/chat/nutricionista/  responde o chat (gated por assinatura ativa)
    api/treino/substituir/   sugere exercícios alternativos ("academia lotada")
    termos/, privacidade/    páginas legais (LGPD)
    robots.ts, sitemap.ts    SEO básico
    manifest.ts              manifest do PWA
  components/ui/             componentes base (Button, Input, Card, ...)
  components/dashboard/      nav, sign-out, regenerate plan, meal log form, chat
  lib/supabase/              clients browser/server/service + proxy (sessão)
  lib/ai/openai.ts           chamada estruturada à OpenAI (dieta e chat)
  lib/ai/nutricionista.ts    system prompt do chat Nutricionista
  lib/workout/generator.ts   gerador de treino local (sem IA), a partir da anamnese
  lib/payments/pagarme.ts        cliente server-side da API da Pagar.me
  lib/payments/pagarme-client.ts tokenização de cartão no navegador
  lib/types.ts                schemas zod (anamnese, planos, refeições, assinatura)
  proxy.ts                    protege /dashboard, /anamnese e /assinar (Next.js 16)
supabase/migrations/          schema SQL
.github/workflows/ci.yml      lint + typecheck + build em cada PR
```

O treino é montado por um gerador determinístico (`lib/workout/generator.ts`):
sem chamar IA, ele monta o split semanal a partir de dias disponíveis, nível
e local de treino, aplica volume extra nas "zonas prioritárias" escolhidas na
anamnese e filtra exercícios contraindicados por lesões informadas. A dieta
continua sendo gerada pela OpenAI. `POST /api/gerar-plano` tem um cooldown de
60s por anamnese para evitar cliques repetidos gerando custo de API à toa.

## Deploy

Recomendado: [Vercel](https://vercel.com/new). Configure as mesmas variáveis
de ambiente do `.env.local` no projeto da Vercel (incluindo
`NEXT_PUBLIC_SITE_URL` com o domínio final, usado em `robots.txt` e
`sitemap.xml`), e atualize a Redirect URL no Supabase para o domínio de
produção.

Antes de cobrar cartões reais, valide o fluxo completo da Pagar.me em modo
sandbox — veja o aviso na seção [Assinatura (Pagar.me)](#assinatura-pagarme).

Checklist completo de deploy (Supabase, OpenAI, Pagar.me, LGPD, testes
pós-deploy): [DEPLOY.md](./DEPLOY.md).

## Aviso

Os planos gerados por IA são um ponto de partida e não substituem o
acompanhamento de um profissional de educação física e de um nutricionista,
especialmente em caso de condições médicas.
