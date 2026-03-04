import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Cliente para uso general
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente administrativo (mismo para demo)
export const supabaseAdmin = supabase;
