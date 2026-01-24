
import { createClient } from '@supabase/supabase-js';

// Access environment variables using import.meta.env for Vite or process.env for other builders
// Fix: Casting import.meta to any to resolve TS error when 'env' is not defined on the ImportMeta interface.
const supabaseUrl = ((import.meta as any).env?.VITE_SUPABASE_URL as string) || '';
// Fix: Casting import.meta to any to resolve TS error when 'env' is not defined on the ImportMeta interface.
const supabaseKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Helper to convert phone to a dummy email for Supabase Auth
 * keeping the Phone + Password UI while bypassing SMS providers.
 */
export const phoneToEmail = (phone: string) => `${phone}@gymstack.app`;
