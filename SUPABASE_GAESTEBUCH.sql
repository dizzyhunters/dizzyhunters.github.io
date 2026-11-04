-- Im Supabase SQL Editor einmal ausführen.
create table if not exists public.gaestebuch_eintraege (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 50),
  nachricht text not null check (char_length(trim(nachricht)) between 1 and 500),
  status text not null default 'offen' check (status in ('offen','freigegeben','abgelehnt')),
  erstellt_am timestamptz not null default now()
);
alter table public.gaestebuch_eintraege enable row level security;
grant select on public.gaestebuch_eintraege to anon, authenticated;
grant insert on public.gaestebuch_eintraege to anon, authenticated;
grant update,delete on public.gaestebuch_eintraege to authenticated;
drop policy if exists "Gaestebuch freigegebene Eintraege lesen" on public.gaestebuch_eintraege;
create policy "Gaestebuch freigegebene Eintraege lesen" on public.gaestebuch_eintraege for select to anon,authenticated using (status='freigegeben');
drop policy if exists "Leitung Gaestebuch alles lesen" on public.gaestebuch_eintraege;
create policy "Leitung Gaestebuch alles lesen" on public.gaestebuch_eintraege for select to authenticated using (exists(select 1 from public.leitung where user_id=(select auth.uid())));
drop policy if exists "Besucher Gaestebuch schreiben" on public.gaestebuch_eintraege;
create policy "Besucher Gaestebuch schreiben" on public.gaestebuch_eintraege for insert to anon,authenticated with check (status='offen');
drop policy if exists "Leitung Gaestebuch bearbeiten" on public.gaestebuch_eintraege;
create policy "Leitung Gaestebuch bearbeiten" on public.gaestebuch_eintraege for update to authenticated using (exists(select 1 from public.leitung where user_id=(select auth.uid()))) with check (exists(select 1 from public.leitung where user_id=(select auth.uid())));
drop policy if exists "Leitung Gaestebuch loeschen" on public.gaestebuch_eintraege;
create policy "Leitung Gaestebuch loeschen" on public.gaestebuch_eintraege for delete to authenticated using (exists(select 1 from public.leitung where user_id=(select auth.uid())));
