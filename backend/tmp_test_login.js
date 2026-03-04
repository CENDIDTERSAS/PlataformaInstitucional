require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuración básica
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('⚠️ Error: Falta URL o ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLoginFlow() {
    console.log("--- INICIANDO PRUEBA DE LOGIN ---");
    const email = 'colaborador@prueba.com';
    const password = 'Prueba2026!';
    
    console.log(`1. Intentando hacer login con ${email} / ${password}...`);
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });
    
    if (authError) {
        console.error("❌ ERROR EN AUTH:", authError.message);
        return;
    }
    
    console.log("✅ AUTH EXITOSO. User ID:", authData.user.id);
    
    console.log("2. Verificando si existe la sesión...");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        console.error("❌ ERROR: No se generó la sesión.");
    } else {
        console.log("✅ SESIÓN GENERADA. Access Token:", session.access_token.substring(0, 20) + "...");
    }
    
    console.log("3. Verificando si existe el perfil en la base de datos...");
    const { data: profileData, error: profileError } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();
        
    if (profileError) {
        console.error("❌ ERROR AL OBETENER PERFIL:", profileError.message);
        if (profileError.code === 'PGRST116') {
             console.log("ℹ️ Esto significa no se encontró la fila correspondiente en la tabla 'perfiles'.");
        }
    } else {
        console.log("✅ PERFIL ENCONTRADO:", JSON.stringify(profileData));
        console.log("   --> Estado:", profileData.estado);
        console.log("   --> Rol:", profileData.rol);
    }
    
    console.log("--- PRUEBA FINALIZADA ---");
}

testLoginFlow();
