-- ==========================================================================
-- anamnesis: adiciona zonas musculares prioritárias, usadas pelo gerador de
-- treino para aplicar volume extra nos grupos escolhidos pelo usuário.
-- ==========================================================================
alter table public.anamnesis
  add column if not exists zonas_prioritarias text[] not null default '{}';
