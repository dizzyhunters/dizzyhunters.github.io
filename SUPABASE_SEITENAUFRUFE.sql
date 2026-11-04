-- Zaehlt jeden Startseitenaufruf atomar, auch bei gleichzeitigen Besuchen.
CREATE TABLE IF NOT EXISTS public.seitenaufrufe (
  zaehler_id integer PRIMARY KEY CHECK (zaehler_id = 1),
  anzahl bigint NOT NULL DEFAULT 0 CHECK (anzahl >= 0)
);
INSERT INTO public.seitenaufrufe (zaehler_id, anzahl)
VALUES (1, 0) ON CONFLICT (zaehler_id) DO NOTHING;

ALTER TABLE public.seitenaufrufe ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.seitenaufrufe FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.seitenaufruf_zaehlen()
RETURNS bigint
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
  UPDATE public.seitenaufrufe
  SET anzahl = anzahl + 1
  WHERE zaehler_id = 1
  RETURNING anzahl;
$$;
REVOKE ALL ON FUNCTION public.seitenaufruf_zaehlen() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.seitenaufruf_zaehlen() TO anon, authenticated;
NOTIFY pgrst, 'reload schema';
