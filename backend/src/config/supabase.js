import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseServiceKey &&
  supabaseServiceKey !== 'your-supabase-service-role-key'
);

/**
 * Privileged Admin Supabase Client (bypasses RLS)
 * Used strictly for backend system operations: user sync, audit log recording, admin operations
 */
export const supabaseAdmin = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

/**
 * Public Anonymous Supabase Client
 */
export const supabasePublic = (isSupabaseConfigured && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Helper to create a user-scoped Supabase client that forwards the incoming Bearer JWT.
 * This guarantees database-level Row Level Security (RLS) is applied to the exact user identity.
 */
export const createUserClient = (accessToken) => {
  if (!isSupabaseConfigured) return null;
  return createClient(supabaseUrl, supabaseAnonKey || supabaseServiceKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    auth: {
      persistSession: false
    }
  });
};

if (!isSupabaseConfigured) {
  console.warn(
    '\n⚠️  [MediCore Connect] Live Supabase credentials not set or using placeholders in backend/.env.\n' +
    '   Running in development simulation fallback mode for local testing.\n' +
    '   Add valid SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to connect to live Supabase.\n'
  );
}
