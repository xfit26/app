-- ==========================================================================
-- Reformulação da anamnese (onboarding em 6 etapas: gênero, local de treino,
-- dados pessoais, cálculo de TMB/água/objetivo, mapa corporal e dieta).
-- Projeto ainda em desenvolvimento — recriamos a tabela em vez de migrar
-- dados antigos.
-- ==========================================================================
drop table if exists public.diet_plans cascade;
drop table if exists public.workout_plans cascade;
drop table if exists public.anamnesis cascade;

create table public.anamnesis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  genero text not null,
  local_treino text not null,
  nome text not null,
  altura_cm numeric not null,
  peso_kg numeric not null,
  idade int not null,
  percentual_gordura numeric,
  nivel_experiencia text not null,
  frequencia_treino int not null,
  dias_aerobico int not null,
  restricoes_saude text not null default '',
  objetivo text not null,
  zonas_alvo text[] not null default '{}',
  refeicoes_por_dia int not null,
  tipo_dieta text not null,
  proteinas text[] not null default '{}',
  carboidratos text[] not null default '{}',
  gorduras text[] not null default '{}',
  tmb numeric not null,
  gasto_total numeric not null,
  meta_calorica numeric not null,
  agua_ml numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.anamnesis enable row level security;

create policy "anamnesis_select_own" on public.anamnesis for select using (auth.uid() = user_id);
create policy "anamnesis_insert_own" on public.anamnesis for insert with check (auth.uid() = user_id);
create policy "anamnesis_update_own" on public.anamnesis for update using (auth.uid() = user_id);
create policy "anamnesis_delete_own" on public.anamnesis for delete using (auth.uid() = user_id);

create index anamnesis_user_id_created_at_idx on public.anamnesis (user_id, created_at desc);

-- ==========================================================================
-- workout_plans / diet_plans — recriadas (mesmo formato de antes)
-- ==========================================================================
create table public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  anamnesis_id uuid not null references public.anamnesis (id) on delete cascade,
  conteudo jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.workout_plans enable row level security;
create policy "workout_plans_select_own" on public.workout_plans for select using (auth.uid() = user_id);
create policy "workout_plans_insert_own" on public.workout_plans for insert with check (auth.uid() = user_id);
create policy "workout_plans_delete_own" on public.workout_plans for delete using (auth.uid() = user_id);
create index workout_plans_user_id_created_at_idx on public.workout_plans (user_id, created_at desc);

create table public.diet_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  anamnesis_id uuid not null references public.anamnesis (id) on delete cascade,
  conteudo jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.diet_plans enable row level security;
create policy "diet_plans_select_own" on public.diet_plans for select using (auth.uid() = user_id);
create policy "diet_plans_insert_own" on public.diet_plans for insert with check (auth.uid() = user_id);
create policy "diet_plans_delete_own" on public.diet_plans for delete using (auth.uid() = user_id);
create index diet_plans_user_id_created_at_idx on public.diet_plans (user_id, created_at desc);

-- ==========================================================================
-- water_logs: registro de consumo de água do dia
-- ==========================================================================
create table public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  quantidade_ml int not null,
  created_at timestamptz not null default now()
);

alter table public.water_logs enable row level security;
create policy "water_logs_select_own" on public.water_logs for select using (auth.uid() = user_id);
create policy "water_logs_insert_own" on public.water_logs for insert with check (auth.uid() = user_id);
create policy "water_logs_delete_own" on public.water_logs for delete using (auth.uid() = user_id);
create index water_logs_user_id_created_at_idx on public.water_logs (user_id, created_at desc);

-- ==========================================================================
-- body_measurements: evolução (medidas + % de gordura via 7 dobras)
-- ==========================================================================
create table public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  peso_kg numeric not null,
  peito_cm numeric,
  cintura_cm numeric,
  quadril_cm numeric,
  braco_cm numeric,
  coxa_cm numeric,
  dobras jsonb,
  percentual_gordura numeric,
  created_at timestamptz not null default now()
);

alter table public.body_measurements enable row level security;
create policy "body_measurements_select_own" on public.body_measurements for select using (auth.uid() = user_id);
create policy "body_measurements_insert_own" on public.body_measurements for insert with check (auth.uid() = user_id);
create policy "body_measurements_delete_own" on public.body_measurements for delete using (auth.uid() = user_id);
create index body_measurements_user_id_created_at_idx on public.body_measurements (user_id, created_at desc);

-- ==========================================================================
-- progress_photos: fotos de antes/depois (armazenadas no Storage; aqui só o
-- caminho do arquivo e a legenda)
-- ==========================================================================
create table public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null,
  legenda text not null default '',
  created_at timestamptz not null default now()
);

alter table public.progress_photos enable row level security;
create policy "progress_photos_select_own" on public.progress_photos for select using (auth.uid() = user_id);
create policy "progress_photos_insert_own" on public.progress_photos for insert with check (auth.uid() = user_id);
create policy "progress_photos_delete_own" on public.progress_photos for delete using (auth.uid() = user_id);
create index progress_photos_user_id_created_at_idx on public.progress_photos (user_id, created_at desc);

-- ==========================================================================
-- video_corrections: vídeos de treino enviados para correção por IA (áudio).
-- O arquivo de vídeo em si é apagado do Storage assim que o feedback é
-- gerado; o registro (com o áudio de feedback) expira e é removido depois de
-- 48h — ver expires_at e a limpeza feita em /api/videos/limpar.
-- ==========================================================================
create table public.video_corrections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  exercicio text not null,
  observacao text,
  status text not null default 'processando',
  feedback_texto text,
  feedback_audio_path text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '48 hours')
);

alter table public.video_corrections enable row level security;
create policy "video_corrections_select_own" on public.video_corrections for select using (auth.uid() = user_id);
create policy "video_corrections_insert_own" on public.video_corrections for insert with check (auth.uid() = user_id);
create policy "video_corrections_delete_own" on public.video_corrections for delete using (auth.uid() = user_id);
create index video_corrections_user_id_created_at_idx on public.video_corrections (user_id, created_at desc);

-- ==========================================================================
-- exercises / exercise_substitutions: catálogo do "assistente de academia
-- lotada". `exercises` é legível pelos usuários (para montar o seletor);
-- `exercise_substitutions` é a base "escondida" do admin — sem policy de
-- select para o client, só acessível via service role (rota
-- /api/substituir).
-- ==========================================================================
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  grupo_muscular text not null,
  padrao_movimento text not null,
  local_treino text not null
);

alter table public.exercises enable row level security;
create policy "exercises_select_authenticated"
  on public.exercises for select
  to authenticated
  using (true);

create table public.exercise_substitutions (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  substitute_id uuid not null references public.exercises (id) on delete cascade
);

alter table public.exercise_substitutions enable row level security;
-- Sem policies de select/insert/update/delete para authenticated/anon: a
-- tabela só é lida pela rota de servidor com a service role key.

-- ==========================================================================
-- Buckets de Storage (privados) + policies por pasta do usuário
-- (<user_id>/arquivo.ext)
-- ==========================================================================
insert into storage.buckets (id, name, public)
values
  ('progress-photos', 'progress-photos', false),
  ('diet-photos', 'diet-photos', false),
  ('exercise-videos', 'exercise-videos', false),
  ('video-feedback-audio', 'video-feedback-audio', false)
on conflict (id) do nothing;

create policy "progress_photos_storage_own"
  on storage.objects for all
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "diet_photos_storage_own"
  on storage.objects for all
  using (bucket_id = 'diet-photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'diet-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "exercise_videos_storage_own"
  on storage.objects for all
  using (bucket_id = 'exercise-videos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'exercise-videos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "video_feedback_audio_storage_own"
  on storage.objects for all
  using (bucket_id = 'video-feedback-audio' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'video-feedback-audio' and (storage.foldername(name))[1] = auth.uid()::text);

-- ==========================================================================
-- Seed do catálogo de exercícios + substituições (assistente de academia
-- lotada). Cobre os principais grupos musculares em casa e na academia.
-- ==========================================================================
with novos as (
  insert into public.exercises (nome, grupo_muscular, padrao_movimento, local_treino)
  values
    ('Supino reto com barra', 'peitoral', 'empurrar_horizontal', 'academia'),
    ('Supino reto com halteres', 'peitoral', 'empurrar_horizontal', 'academia'),
    ('Crucifixo no cross-over', 'peitoral', 'empurrar_horizontal', 'academia'),
    ('Flexão de braço', 'peitoral', 'empurrar_horizontal', 'casa'),
    ('Puxada frente na polia', 'costas', 'puxar_vertical', 'academia'),
    ('Remada curvada com barra', 'costas', 'puxar_horizontal', 'academia'),
    ('Remada unilateral com halter', 'costas', 'puxar_horizontal', 'academia'),
    ('Barra fixa (pull-up)', 'costas', 'puxar_vertical', 'casa'),
    ('Remada com elástico', 'costas', 'puxar_horizontal', 'casa'),
    ('Desenvolvimento com halteres', 'ombro', 'empurrar_vertical', 'academia'),
    ('Desenvolvimento militar com barra', 'ombro', 'empurrar_vertical', 'academia'),
    ('Elevação lateral com halteres', 'ombro', 'abducao_ombro', 'academia'),
    ('Elevação lateral com elástico', 'ombro', 'abducao_ombro', 'casa'),
    ('Rosca direta com barra', 'biceps', 'flexao_cotovelo', 'academia'),
    ('Rosca alternada com halteres', 'biceps', 'flexao_cotovelo', 'academia'),
    ('Rosca com elástico', 'biceps', 'flexao_cotovelo', 'casa'),
    ('Tríceps corda na polia', 'triceps', 'extensao_cotovelo', 'academia'),
    ('Tríceps testa com barra', 'triceps', 'extensao_cotovelo', 'academia'),
    ('Mergulho no banco (dips)', 'triceps', 'extensao_cotovelo', 'casa'),
    ('Agachamento livre com barra', 'quadriceps', 'agachamento', 'academia'),
    ('Leg press 45°', 'quadriceps', 'agachamento', 'academia'),
    ('Cadeira extensora', 'quadriceps', 'extensao_joelho', 'academia'),
    ('Agachamento livre (peso corporal)', 'quadriceps', 'agachamento', 'casa'),
    ('Afundo (passada)', 'quadriceps', 'agachamento_unilateral', 'casa'),
    ('Elevação pélvica (hip thrust)', 'gluteo', 'extensao_quadril', 'academia'),
    ('Cadeira abdutora', 'gluteo', 'abducao_quadril', 'academia'),
    ('Agachamento sumô com halter', 'gluteo', 'agachamento', 'academia'),
    ('Elevação pélvica no chão', 'gluteo', 'extensao_quadril', 'casa'),
    ('Stiff com barra', 'posterior_coxa', 'dobradica_quadril', 'academia'),
    ('Mesa flexora', 'posterior_coxa', 'flexao_joelho', 'academia'),
    ('Stiff com halteres', 'posterior_coxa', 'dobradica_quadril', 'casa'),
    ('Panturrilha em pé na máquina', 'panturrilha', 'flexao_plantar', 'academia'),
    ('Panturrilha em pé (peso corporal)', 'panturrilha', 'flexao_plantar', 'casa'),
    ('Abdominal supra no solo', 'abdomen', 'flexao_tronco', 'casa'),
    ('Prancha abdominal', 'abdomen', 'estabilizacao_core', 'casa'),
    ('Abdominal na polia alta', 'abdomen', 'flexao_tronco', 'academia')
  returning id, nome, grupo_muscular, padrao_movimento
)
insert into public.exercise_substitutions (exercise_id, substitute_id)
select a.id, b.id
from novos a
join novos b
  on a.grupo_muscular = b.grupo_muscular
  and a.padrao_movimento = b.padrao_movimento
  and a.id <> b.id;
