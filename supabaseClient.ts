
import { createClient } from 'https://jspm.dev/@supabase/supabase-js';

// Accessing environment variables via process.env as per the environment standards.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase configuration missing. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in environment variables.");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
