-- Einmal im Supabase SQL Editor ausführen. Bestehende Missionen bleiben erhalten.
create table if not exists public.dizzy_trainer (
 id uuid primary key default gen_random_uuid(),
 sso_name text not null check (char_length(trim(sso_name)) between 2 and 80),
 name_key text generated always as (lower(trim(sso_name))) stored unique,
 pin_salt text not null, pin_hash text not null,
 failed_attempts int not null default 0,
 locked_until timestamptz,
 created_at timestamptz not null default now()
);
create table if not exists public.dizzy_trainer_sessions (
 token_hash text primary key,
 trainer_id uuid not null references public.dizzy_trainer(id) on delete cascade,
 expires_at timestamptz not null
);
create table if not exists public.dizzy_mission_completions (
 trainer_id uuid not null references public.dizzy_trainer(id) on delete cascade,
 mission_id uuid not null references public.missionen(id) on delete cascade,
 completed_at timestamptz not null default now(),
 primary key(trainer_id,mission_id)
);
alter table public.dizzy_trainer enable row level security;
alter table public.dizzy_trainer_sessions enable row level security;
alter table public.dizzy_mission_completions enable row level security;
-- Kein direkter Tabellenzugriff für Website-Besucher; nur die Edge Function mit Service-Role.
revoke all on public.dizzy_trainer from anon, authenticated;
revoke all on public.dizzy_trainer_sessions from anon, authenticated;
revoke all on public.dizzy_mission_completions from anon, authenticated;
-- Bereits existierende Policies entfernen, falls vorherige Testversionen vorhanden sind.
-- Nicht die Missionen-Tabelle ändern: deren bestehende Lese- und Leitungsrechte bleiben erhalten.
