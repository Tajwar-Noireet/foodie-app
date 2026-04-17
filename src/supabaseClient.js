import { createClient } from '@supabase/supabase-js';

// Vite requires 'import.meta.env' to read from the .env.local file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create and export the secure connection
export const supabase = createClient(supabaseUrl, supabaseAnonKey);