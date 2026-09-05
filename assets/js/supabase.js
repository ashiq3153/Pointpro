// Supabase client configuration
// Add the real values in Vercel Environment Variables before enabling cloud data.
const SUPABASE_URL = window.POINTPRO_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = window.POINTPRO_SUPABASE_ANON_KEY || "";

export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

export const isSupabaseConfigured = Boolean(supabase);
