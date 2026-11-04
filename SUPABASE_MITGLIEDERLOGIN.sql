-- Dizzy Hunters: SQL Editor, einmalig ausführen.
-- Vorher sicherstellen, dass public.leitung und public.missionen bereits existieren.
BEGIN;
CREATE TABLE IF NOT EXISTS public.club_mitglieder (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 hinzugefuegt_am timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.club_mitglieder ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.club_mitglieder TO authenticated;
REVOKE ALL ON public.club_mitglieder FROM anon;
DROP POLICY IF EXISTS "Mitglied prüft eigenen Zugang" ON public.club_mitglieder;
CREATE POLICY "Mitglied prüft eigenen Zugang" ON public.club_mitglieder
 FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
-- Auch Leitung als Mitglied freischalten, ohne ihre Berechtigung zu verändern.
INSERT INTO public.club_mitglieder(user_id)
 SELECT user_id FROM public.leitung ON CONFLICT (user_id) DO NOTHING;
-- Bisherige öffentliche Leseberechtigung der Missionen ENTFERNEN.
DROP POLICY IF EXISTS "Missionen lesen" ON public.missionen;
DROP POLICY IF EXISTS "Nur Mitglieder lesen Missionen" ON public.missionen;
REVOKE SELECT ON public.missionen FROM anon;
GRANT SELECT ON public.missionen TO authenticated;
CREATE POLICY "Nur Mitglieder lesen Missionen" ON public.missionen
 FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.club_mitglieder m WHERE m.user_id = (SELECT auth.uid()))
 );
COMMIT;
-- Weitere Mitglieder: Authentication > Users > Add user anlegen,
-- User UID kopieren, danach mit SQL Editor hinzufügen:
-- INSERT INTO public.club_mitglieder(user_id) VALUES ('HIER-USER-UID')
-- ON CONFLICT (user_id) DO NOTHING;
-- KEIN gemeinsames öffentliches Passwort im GitHub-Code speichern.
