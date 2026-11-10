-- Einmalig im Supabase SQL Editor ausführen.
create table if not exists public.clubkalender_termine (
 id bigint generated always as identity primary key,
 titel text not null check (char_length(titel) between 1 and 120),
 datum date not null,
 uhrzeit time not null,
 kategorie text not null default 'Clubtreffen',
 ort text,
 beschreibung text,
 erstellt_am timestamptz not null default now()
);
alter table public.clubkalender_termine enable row level security;
grant select on public.clubkalender_termine to anon, authenticated;
grant insert, update, delete on public.clubkalender_termine to authenticated;
grant usage, select on sequence public.clubkalender_termine_id_seq to authenticated;
-- Leserechte sind öffentlich: das Clubpasswort der Website ist nur eine clientseitige Zugangsschranke.
create policy "Kalender lesen" on public.clubkalender_termine for select to anon, authenticated using (true);
create policy "Leitung Termine erstellen" on public.clubkalender_termine for insert to authenticated with check (exists (select 1 from public.leitung where user_id = (select auth.uid())));
create policy "Leitung Termine ändern" on public.clubkalender_termine for update to authenticated using (exists (select 1 from public.leitung where user_id = (select auth.uid()))) with check (exists (select 1 from public.leitung where user_id = (select auth.uid())));
create policy "Leitung Termine löschen" on public.clubkalender_termine for delete to authenticated using (exists (select 1 from public.leitung where user_id = (select auth.uid())));
