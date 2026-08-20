import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 'https://jseihmoupjkrptuwydyo.supabase.co';
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || 'sb_publishable_SEEp28Op-JNAgKEZC82OTg_bPys1i1l';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials missing from environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
