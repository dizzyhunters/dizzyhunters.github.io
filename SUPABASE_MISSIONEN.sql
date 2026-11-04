-- Dizzy Hunters: im Supabase SQL Editor ausführen.
-- Missionen sind derzeit öffentlich LESBAR, weil der Mitgliederbereich
-- noch keinen eigenen Login hat. Keine privaten Daten eintragen!
create table if not exists public.missionen (
 id uuid primary key default gen_random_uuid(),
 titel text not null check (char_length(trim(titel)) between 1 and 120),
 mitglied text,
 beschreibung text not null check (char_length(trim(beschreibung)) between 1 and 3000),
 woche_vom date not null,
 xp integer not null default 20 check (xp between 0 and 10000),
 erstellt_am timestamptz not null default now()
);
alter table public.missionen enable row level security;
grant select on public.missionen to anon,authenticated;
grant insert,update,delete on public.missionen to authenticated;
drop policy if exists "Missionen lesen" on public.missionen;
create policy "Missionen lesen" on public.missionen for select to anon,authenticated using (true);
drop policy if exists "Leitung erstellt Missionen" on public.missionen;
create policy "Leitung erstellt Missionen" on public.missionen for insert to authenticated
with check (exists(select 1 from public.leitung where user_id=(select auth.uid())));
drop policy if exists "Leitung bearbeitet Missionen" on public.missionen;
create policy "Leitung bearbeitet Missionen" on public.missionen for update to authenticated
using (exists(select 1 from public.leitung where user_id=(select auth.uid())))
with check (exists(select 1 from public.leitung where user_id=(select auth.uid())));
drop policy if exists "Leitung löscht Missionen" on public.missionen;
create policy "Leitung löscht Missionen" on public.missionen for delete to authenticated
using (exists(select 1 from public.leitung where user_id=(select auth.uid())));
