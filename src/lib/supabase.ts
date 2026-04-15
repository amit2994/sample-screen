import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Only create a real client if Supabase is configured.
// Otherwise, export null — the useComments hook falls back to local storage.
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseUrl !== 'your_supabase_url'
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
