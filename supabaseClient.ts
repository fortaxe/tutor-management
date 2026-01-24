
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

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));

// Initialize with dummy values if missing to prevent crash, check isSupabaseConfigured in App.tsx
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

if (!isSupabaseConfigured) {
  console.error("Supabase configuration missing or invalid. Dashboard will show setup instructions.");
}
