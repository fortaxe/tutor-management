
// Using esm.sh for better compatibility in browser-native ESM environments
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const getEnv = (key: string): string | undefined => {
  try {
    // Check process.env (Node/Vite polyfill)
    if (typeof process !== 'undefined' && process.env) {
      return (process.env as any)[key];
    }
    // Check import.meta.env (Vite native)
    if (typeof (import.meta as any).env !== 'undefined') {
      return (import.meta as any).env[key];
    }
  } catch (e) {
    console.warn(`Error accessing env key ${key}:`, e);
  }
  return undefined;
};

export const SUPABASE_URL = getEnv('VITE_SUPABASE_URL');
export const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY');
export const SUPER_ADMIN_PHONE = getEnv('VITE_SUPER_ADMIN_PHONE') || '9999999999';
export const SUPER_ADMIN_PASSWORD = getEnv('VITE_SUPER_ADMIN_PASSWORD') || 'admin';

export const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.startsWith('http'));

// Initialize with dummy values if missing to prevent crash, check isSupabaseConfigured in App.tsx
export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder'
);

if (!isSupabaseConfigured) {
  console.error("Supabase configuration missing or invalid. Dashboard will show setup instructions.");
}
