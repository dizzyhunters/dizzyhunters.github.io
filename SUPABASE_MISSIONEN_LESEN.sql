-- Nur ausführen, wenn Missionen keine vertraulichen Informationen enthalten.
-- Ein reines GitHub-Passwortfeld kann Daten nicht wirksam schützen.
-- Diese Freigabe macht Missionen über die Supabase-API öffentlich lesbar.
BEGIN;
GRANT SELECT ON public.missionen TO anon;
DROP POLICY IF EXISTS "Missionen lesen" ON public.missionen;
CREATE POLICY "Missionen lesen" ON public.missionen FOR SELECT TO anon USING (true);
COMMIT;
