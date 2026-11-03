DIZZY HUNTERS – SUPABASE EINRICHTUNG

1. Im Supabase-Projekt SQL Editor öffnen und SUPABASE_EINRICHTUNG.sql vollständig ausführen.
2. Prüfen, dass dein Auth-Benutzer in public.leitung mit seiner User UID steht.
3. Diese Website-Dateien in das GitHub-Pages-Repository hochladen (Inhalt des Ordners, nicht den Ordner selbst).
4. Bewerbungsfach testen: Formular ausfüllen und absenden.
5. Leitungszentrale: Mit E-Mail und Passwort des in Supabase Auth erstellten Leitungsaccounts anmelden.
6. Status ändern und öffentliche Warteliste prüfen.

WICHTIG: Ohne SQL-Schritt funktioniert die Einreichung noch nicht.
Das Formular verlangt mindestens 13 Jahre; die Datenbank prüft das ebenfalls.
Die öffentliche Warteliste zeigt nur Rufnamen. Da Rufnamen personenbezogene Daten sein können, bitte einen Datenschutzhinweis und Löschfristen ergänzen.
Die öffentliche RPC erlaubt anonyme Bewerbungen. Gegen Spam vor Produktivbetrieb zusätzlich Rate-Limiting/CAPTCHA (z.B. via Edge Function + Turnstile) einrichten.
Für Supabase Auth die Email-Login-Methode aktiviert lassen.
Der Publishable Key ist öffentlich nutzbar; niemals service_role/secret keys einbauen.
