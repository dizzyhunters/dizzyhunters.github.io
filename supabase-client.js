window.dizzyClient = window.supabase.createClient(window.DIZZY_SUPABASE.url, window.DIZZY_SUPABASE.key, {auth:{persistSession:true,autoRefreshToken:true}});
