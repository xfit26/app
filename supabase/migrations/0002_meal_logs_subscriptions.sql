-- ==========================================================================
-- meal_logs: registro de refeições do usuário, usado como contexto para o
-- chat "Nutricionista"
-- ==========================================================================
create table if not exists public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  refeicao text not null,
  descricao text not null,
  calorias_estimadas int,
  horario timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.meal_logs enable row level security;

create policy "meal_logs_select_own"
  on public.meal_logs for select
  using (auth.uid() = user_id);

create policy "meal_logs_insert_own"
  on public.meal_logs for insert
  with check (auth.uid() = user_id);

create policy "meal_logs_delete_own"
  on public.meal_logs for delete
  using (auth.uid() = user_id);

create index if not exists meal_logs_user_id_horario_idx
  on public.meal_logs (user_id, horario desc);

-- ==========================================================================
-- subscriptions: assinatura paga (Pagar.me) que libera o chat Nutricionista
-- ==========================================================================
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  plano text not null,
  status text not null default 'pending',
  pagarme_customer_id text,
  pagarme_subscription_id text unique,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

-- leitura permitida ao próprio usuário; toda escrita passa pelas rotas de
-- API usando a service role (criação via /api/assinatura, atualização via
-- webhook), então não há policies de insert/update/delete para o cliente.
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create index if not exists subscriptions_pagarme_subscription_id_idx
  on public.subscriptions (pagarme_subscription_id);
