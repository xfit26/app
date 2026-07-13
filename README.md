# Léo Moura — Treino e dieta personalizados por IA

Web app (PWA) de treinos montados pelo treinador Léo Moura e adaptados por
IA, com dieta personalizada, a partir das respostas de uma anamnese guiada
em 6 etapas. Inclui painel do aluno com água, evolução, chats de IA
(Treinador / Nutricionista / Suplementos), assistente de "academia lotada" e
um plano de 8 semanas com módulos extras (foto da dieta, suplementos,
correção de vídeo).

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4)
- **Supabase** — autenticação (e-mail/senha), Postgres com Row Level
  Security e Storage (fotos de evolução, fotos de refeição, vídeos e áudio
  de feedback)
- **OpenAI** — geração de treino/dieta (JSON estruturado), os 3 chats de
  IA, análise de foto de refeição (visão), orientação sobre suplementos e
  feedback de vídeo em texto + áudio (TTS)
- **Pagar.me** — cobrança do plano de 8 semanas
- **react-hook-form + zod** — formulários com validação
- PWA — instalável no celular

## Onboarding (anamnese em 6 etapas)

1. **Gênero** — define o tema visual do app: **masculino** → preto com
   detalhes em azul e branco; **feminino** → preto com detalhes em rosa e
   branco (`src/app/globals.css`, `[data-theme="masculino"|"feminino"]`).
2. **Local de treino** — casa ou academia.
3. **Dados pessoais** — nome, altura, peso, idade, % de gordura (opcional),
   nível de atividade física (iniciante/intermediário/avançado), frequência
   de treino (3–6x/semana) e disponibilidade para aeróbico (0–7 dias).
4. **Cálculo e objetivo** — TMB pela fórmula de **Harris-Benedict**, gasto
   total diário (TMB × fator de atividade) e meta de água (**50 ml por kg de
   peso**). O usuário escolhe o objetivo, que ajusta a meta calórica sobre o
   gasto total: emagrecimento (-700 kcal), definição (-500 kcal) ou ganho de
   massa (+500 kcal). Ver `src/lib/calc/tmb.ts`.
5. **Mapa corporal** — diagrama corporal interativo (frente/costas) para
   escolher as zonas musculares a priorizar no treino (`src/components/onboarding/body-map.tsx`).
6. **Dieta** — refeições por dia (3–6), tipo de dieta (vegana, vegetariana,
   tradicional, carb cycling) e as proteínas/carboidratos/gorduras
   aceitos. A IA monta o treino e a dieta usando **todas** essas respostas
   (`src/lib/ai/openai.ts`, `buildPrompt`).

## Painel do aluno

- **Treino / Dieta** — plano gerado pela IA a partir da anamnese.
- **Água** (`/dashboard/agua`) — meta diária e registro de consumo.
- **Evolução** (`/dashboard/evolucao`) — medidas corporais, fotos de
  antes/depois e % de gordura pelo protocolo de **7 dobras cutâneas**
  (Jackson & Pollock, equação de Siri — `src/lib/calc/skinfold.ts`), com
  comparação automática entre o registro atual e o mais próximo há 25+ dias.
- **Academia lotada** (`/dashboard/substituir`) — escolha um exercício
  ocupado e receba 2 substitutos com o mesmo estímulo muscular, vindos de
  uma base (`exercise_substitutions`) que não é exposta ao client — só é
  lida no servidor com a service role.
- **3 chats de IA**: **Treinador** (dúvidas sobre o treino), **Nutricionista**
  (dúvidas sobre a dieta) e **Suplementos** (dúvidas gerais sobre
  suplementação).

## Plano de 8 semanas (módulos com cadeado 🔒)

Assinatura única (`/assinar`), verificada por `temPlano8Semanas()` em
`src/lib/types.ts`:

- **Foto da dieta** (`/dashboard/foto-dieta`) — estimativa de calorias e
  macros a partir de uma foto (visão da OpenAI).
- **Suplementos** (`/dashboard/suplementos`) — lista das categorias comuns
  (whey, creatina, albumina, hipercalórico, termogênico, glutamina,
  pré-treino) e um campo para verificar um produto específico.
- **Correção de treino por vídeo** (`/dashboard/videos`) — até 6 vídeos
  ativos por vez; o vídeo é apagado do Storage logo após a correção ser
  gerada, e o feedback (texto + áudio) expira e é apagado **48h** depois do
  envio (limpeza feita a cada carregamento da página/rota, em
  `src/lib/video-cleanup.ts`).

### ⚠️ Limitações importantes (leia antes de usar em produção)

- O **mapa corporal** é um diagrama 2D estilizado (com efeito de brilho/grid
  "futurista"), **não** um modelo 3D anatômico real — não há malha 3D nem
  engine de renderização 3D neste projeto.
- A **verificação de suplementos** usa o conhecimento geral do modelo de IA;
  **não há integração com a base de dados/laudos da ANVISA**. A resposta
  sempre orienta o usuário a confirmar em
  [consultas.anvisa.gov.br](https://consultas.anvisa.gov.br/#/saude/). Não
  trate a resposta como uma aprovação/reprovação oficial.
- A **correção de vídeo** não faz visão computacional quadro a quadro do
  vídeo enviado. O feedback é gerado por texto a partir do nome do exercício
  e das observações do aluno (o que ele sentiu/percebeu na execução), depois
  convertido em áudio por TTS. O vídeo em si não é analisado nem armazenado
  permanentemente.
- A limpeza dos vídeos/feedback expirados (48h) é **preguiçosa** (roda a
  cada acesso à página/rota de upload), não um cron de verdade. Para limpeza
  garantida mesmo sem acesso do usuário, agende uma chamada periódica a uma
  rota de limpeza dedicada (ex: Supabase Edge Function + `pg_cron`, ou um
  cron job externo).

## Configuração

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Em **SQL Editor**, rode em ordem: `0001_init.sql`,
   `0002_meal_logs_subscriptions.sql` e `0003_onboarding_v2.sql` (esta
   última recria `anamnesis`/`workout_plans`/`diet_plans` com o novo
   formato, cria as tabelas de água/medidas/fotos/vídeos/exercícios, os
   buckets de Storage e faz o seed do catálogo de exercícios).
3. Em **Project Settings > API**, copie a **Project URL**, a **anon public
   key** e a **service_role key**.
4. Em **Authentication > URL Configuration**, adicione
   `http://localhost:3000/auth/callback` (e a URL de produção) como
   Redirect URL.

### 2. OpenAI

Crie uma chave em
[platform.openai.com/api-keys](https://platform.openai.com/api-keys). O
modelo configurado (`OPENAI_MODEL`, padrão `gpt-4o-mini`) precisa suportar
visão (foto da dieta) e a conta precisa ter acesso à API de TTS
(`audio.speech`, usada na correção de vídeo).

### 3. Pagar.me

Crie uma conta em [dashboard.pagar.me](https://dashboard.pagar.me), copie a
secret key e a public key (comece pelas chaves de teste) e cadastre a URL do
webhook com Basic Auth:
`https://usuario:senha@seu-dominio.com/api/webhooks/pagarme`.

### 4. Variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha conforme os comentários em `.env.example`.

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
    page.tsx                       landing page
    login/, cadastro/               autenticação
    anamnese/                       onboarding em 6 etapas
    assinar/                        checkout do plano de 8 semanas
    dashboard/
      page.tsx                      visão geral
      treino/, dieta/, refeicoes/   plano + registro de refeições
      agua/                         controle de água
      evolucao/                     medidas, dobras cutâneas e fotos
      substituir/                   assistente de academia lotada
      treinador/, nutricionista/, suplementos-chat/   chats de IA
      foto-dieta/, suplementos/, videos/               módulos do plano 8 semanas
      perfil/
    api/                            rotas de servidor (uma por funcionalidade acima)
  components/
    ui/                             componentes base
    onboarding/body-map.tsx         mapa corporal interativo
    dashboard/                      formulários, chat, nav, locked-feature
    theme/theme-sync.tsx            aplica o tema conforme o gênero
  lib/
    calc/tmb.ts                     Harris-Benedict, água, meta calórica
    calc/skinfold.ts                7 dobras cutâneas (Jackson & Pollock / Siri)
    ai/                             prompts e chamadas à OpenAI (planos, chats, visão, TTS)
    payments/                       Pagar.me
    supabase/                       clients browser/server/service
    theme.ts                        cookie de tema
    types.ts                        schemas zod e tipos
    video-cleanup.ts                expiração das correções de vídeo (48h)
  proxy.ts                          protege /dashboard, /anamnese e /assinar
supabase/migrations/                schema SQL (0001 → 0003)
```

## Aviso

Os planos gerados por IA são um ponto de partida e não substituem o
acompanhamento de um profissional de educação física e de um
nutricionista, especialmente em caso de condições de saúde.
