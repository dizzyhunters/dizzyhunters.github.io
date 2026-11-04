-- Einmalig im Supabase SQL Editor ausführen; vorhandene XP bleiben erhalten.
create table if not exists public.dizzy_xp_bonus (
 id uuid primary key default gen_random_uuid(),
 trainer_id uuid not null references public.dizzy_trainer(id) on delete cascade,
 xp integer not null check (xp between 1 and 1000),
 grund text not null check (char_length(trim(grund)) between 3 and 160),
 awarded_by uuid references auth.users(id),
 created_at timestamptz not null default now()
);
create index if not exists dizzy_xp_bonus_trainer_idx on public.dizzy_xp_bonus(trainer_id);
alter table public.dizzy_xp_bonus enable row level security;
revoke all on public.dizzy_xp_bonus from anon, authenticated;
-- Zugriff ausschließlich durch die beiden Edge Functions mit Service-Role.
