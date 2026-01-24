
import { createClient } from '@supabase/supabase-js';

// Access environment variables using import.meta.env for Vite
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Supabase Configuration Missing! Check your Environment Variables.\n' +
    'Expected: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  );
}

// Initialize with empty strings as fallback to prevent immediate crash, 
// though it will still fail on actual requests.
export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

/**
 * Helper to convert phone to a dummy email for Supabase Auth
 * keeping the Phone + Password UI while bypassing SMS providers.
 */
export const phoneToEmail = (phone: string) => `${phone}@gymstack.app`;
