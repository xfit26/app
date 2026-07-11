-- Extensão necessária para gen_random_uuid()
create extension if not exists "pgcrypto";

-- ==========================================================================
-- profiles: dados básicos do usuário, criados automaticamente no signup
-- ==========================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- cria o profile automaticamente quando um novo usuário se cadastra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================================================
-- anamnesis: respostas do formulário de anamnese usadas para gerar os planos
-- ==========================================================================
create table if not exists public.anamnesis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  idade int not null,
  sexo text not null,
  altura_cm numeric not null,
  peso_kg numeric not null,
  objetivo text not null,
  nivel_experiencia text not null,
  dias_disponiveis int not null,
  tempo_por_sessao_min int not null,
  local_treino text not null,
  equipamentos text[] not null default '{}',
  lesoes_limitacoes text not null default '',
  condicoes_medicas text not null default '',
  restricoes_alimentares text[] not null default '{}',
  alergias text not null default '',
  refeicoes_por_dia int not null,
  nivel_atividade_diaria text not null,
  qualidade_sono text not null,
  nivel_estresse text not null,
  observacoes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.anamnesis enable row level security;

create policy "anamnesis_select_own"
  on public.anamnesis for select
  using (auth.uid() = user_id);

create policy "anamnesis_insert_own"
  on public.anamnesis for insert
  with check (auth.uid() = user_id);

create policy "anamnesis_update_own"
  on public.anamnesis for update
  using (auth.uid() = user_id);

create policy "anamnesis_delete_own"
  on public.anamnesis for delete
  using (auth.uid() = user_id);

create index if not exists anamnesis_user_id_created_at_idx
  on public.anamnesis (user_id, created_at desc);

-- ==========================================================================
-- workout_plans: planos de treino gerados pela IA
-- ==========================================================================
create table if not exists public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  anamnesis_id uuid not null references public.anamnesis (id) on delete cascade,
  conteudo jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.workout_plans enable row level security;

create policy "workout_plans_select_own"
  on public.workout_plans for select
  using (auth.uid() = user_id);

create policy "workout_plans_insert_own"
  on public.workout_plans for insert
  with check (auth.uid() = user_id);

create policy "workout_plans_delete_own"
  on public.workout_plans for delete
  using (auth.uid() = user_id);

create index if not exists workout_plans_user_id_created_at_idx
  on public.workout_plans (user_id, created_at desc);

-- ==========================================================================
-- diet_plans: planos de dieta gerados pela IA
-- ==========================================================================
create table if not exists public.diet_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  anamnesis_id uuid not null references public.anamnesis (id) on delete cascade,
  conteudo jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.diet_plans enable row level security;

create policy "diet_plans_select_own"
  on public.diet_plans for select
  using (auth.uid() = user_id);

create policy "diet_plans_insert_own"
  on public.diet_plans for insert
  with check (auth.uid() = user_id);

create policy "diet_plans_delete_own"
  on public.diet_plans for delete
  using (auth.uid() = user_id);

create index if not exists diet_plans_user_id_created_at_idx
  on public.diet_plans (user_id, created_at desc);
