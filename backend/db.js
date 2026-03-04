require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('⚠️ Error: SUPABASE_URL y SUPABASE_ANON_KEY deben estar configurados en el archivo .env');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : supabase; // Fallback, though admin operations will fail without it

/**
 * Crea un cliente de Supabase con el token del usuario para respetar RLS.
 */
const getSupabaseClient = (token) => {
    if (!token) return supabase;
    const cleanToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
    return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: { Authorization: `Bearer ${cleanToken}` }
        },
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
};

module.exports = { supabase, supabaseAdmin, getSupabaseClient };
