-- DIZZY HUNTERS: im Supabase SQL Editor einmal vollständig ausführen.
-- Voraussetzung: public.bewerbungen und public.leitung existieren bereits.
-- Keine Secret Keys im Browser verwenden.

-- Öffentliche, ausschließlich mit Rufname/Status befüllte Warteliste.
create table if not exists public.oeffentliche_warteliste (
 id uuid primary key references public.bewerbungen(id) on delete cascade,
 anzeigename text not null,
 status text not null check (status in ('offen','angenommen','abgelehnt')),
 erstellt_am timestamptz not null
);
alter table public.oeffentliche_warteliste enable row level security;
revoke all on public.bewerbungen from anon;
revoke all on public.leitung from anon;
grant select on public.oeffentliche_warteliste to anon, authenticated;
-- Ausschließlich Lesezugriff für öffentliche Besucher.
drop policy if exists "Warteliste öffentlich lesen" on public.oeffentliche_warteliste;
create policy "Warteliste öffentlich lesen" on public.oeffentliche_warteliste for select to anon,authenticated using (true);

-- Die Synchronisation läuft serverseitig und veröffentlicht keine Antworten.
create or replace function public.dizzy_warteliste_sync() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
 if TG_OP = 'DELETE' then
  delete from public.oeffentliche_warteliste where id = old.id;
  return old;
 end if;
 insert into public.oeffentliche_warteliste(id,anzeigename,status,erstellt_am)
 values(new.id,new.anzeigename,new.status,new.erstellt_am)
 on conflict (id) do update set anzeigename=excluded.anzeigename,status=excluded.status,erstellt_am=excluded.erstellt_am;
 return new;
end $$;
revoke all on function public.dizzy_warteliste_sync() from public,anon,authenticated;
drop trigger if exists dizzy_warteliste_sync_trigger on public.bewerbungen;
create trigger dizzy_warteliste_sync_trigger after insert or update or delete on public.bewerbungen
for each row execute function public.dizzy_warteliste_sync();
insert into public.oeffentliche_warteliste(id,anzeigename,status,erstellt_am)
select id,anzeigename,status,erstellt_am from public.bewerbungen
on conflict(id) do update set anzeigename=excluded.anzeigename,status=excluded.status,erstellt_am=excluded.erstellt_am;

-- Öffentliche Bewerbung nur über kontrollierte RPC, niemals Tabellen-INSERT.
create or replace function public.bewerbung_einreichen(p_anzeigename text,p_antworten jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare k text;
begin
 if p_anzeigename is null or length(btrim(p_anzeigename)) < 2 or length(p_anzeigename)>80 then
  raise exception 'Ungültiger Rufname';
 end if;
 if p_antworten is null or jsonb_typeof(p_antworten) <> 'object' or length(p_antworten::text)>12000 then
  raise exception 'Ungültige Bewerbung';
 end if;
 foreach k in array array['sso','nickname','discord','instagram','level','uniform','begleiter','starrider','clubs','age','about'] loop
  if length(btrim(coalesce(p_antworten->>k,'')))=0 then raise exception 'Pflichtfeld fehlt: %',k; end if;
 end loop;
 if p_antworten->>'nickname' <> p_anzeigename then raise exception 'Rufname stimmt nicht überein'; end if;
 if (p_antworten->>'age') !~ '^[0-9]{1,3}$' or (p_antworten->>'age')::int < 13 or (p_antworten->>'age')::int > 120 then
  raise exception 'Mindestalter 13 Jahre';
 end if;
 insert into public.bewerbungen(anzeigename,antworten,status)
 values (btrim(p_anzeigename),p_antworten,'offen');
end $$;
revoke all on function public.bewerbung_einreichen(text,jsonb) from public;
grant execute on function public.bewerbung_einreichen(text,jsonb) to anon,authenticated;

-- Direkte Einreichung oder Manipulation über Tabellenrechte verhindern.
revoke insert,update,delete on public.bewerbungen from anon;
revoke insert,update,delete on public.oeffentliche_warteliste from anon,authenticated;
grant select,update,delete on public.bewerbungen to authenticated;
grant select on public.leitung to authenticated;
-- Die bereits erstellten RLS-Policies für die Leitung bleiben aktiv.
