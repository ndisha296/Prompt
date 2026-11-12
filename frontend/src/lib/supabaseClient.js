import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const isLiveSupabaseAvailable = Boolean(
  supabaseUrl &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'your-supabase-anon-key'
);

/**
 * Official Supabase Browser Client
 * Automatically handles JWT session persistence and token refreshes.
 */
export const supabase = isLiveSupabaseAvailable
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
