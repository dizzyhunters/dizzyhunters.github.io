-- In Supabase > SQL Editor ausführen. Bestehende Tabellen bleiben erhalten.
CREATE TABLE IF NOT EXISTS public.clubnews (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 titel text NOT NULL CHECK (char_length(btrim(titel)) BETWEEN 1 AND 120),
 inhalt text NOT NULL CHECK (char_length(btrim(inhalt)) BETWEEN 1 AND 5000),
 erstellt_am timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clubnews ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.clubnews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.clubnews TO authenticated;
DROP POLICY IF EXISTS "Clubnews lesen" ON public.clubnews;
CREATE POLICY "Clubnews lesen" ON public.clubnews FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Leitung erstellt Clubnews" ON public.clubnews;
CREATE POLICY "Leitung erstellt Clubnews" ON public.clubnews FOR INSERT TO authenticated WITH CHECK (EXISTS(SELECT 1 FROM public.leitung WHERE user_id=(SELECT auth.uid())));
DROP POLICY IF EXISTS "Leitung bearbeitet Clubnews" ON public.clubnews;
CREATE POLICY "Leitung bearbeitet Clubnews" ON public.clubnews FOR UPDATE TO authenticated USING (EXISTS(SELECT 1 FROM public.leitung WHERE user_id=(SELECT auth.uid()))) WITH CHECK (EXISTS(SELECT 1 FROM public.leitung WHERE user_id=(SELECT auth.uid())));
DROP POLICY IF EXISTS "Leitung löscht Clubnews" ON public.clubnews;
CREATE POLICY "Leitung löscht Clubnews" ON public.clubnews FOR DELETE TO authenticated USING (EXISTS(SELECT 1 FROM public.leitung WHERE user_id=(SELECT auth.uid())));
