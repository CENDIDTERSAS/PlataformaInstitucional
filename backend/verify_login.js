require('dotenv').config();
const { supabaseAdmin, supabase } = require('./db.js');

async function testRoutine() {
    try {
        console.log("--- RUTINA DE CREACIÓN Y VERIFICACIÓN ---");
        const email = 'usuario_final@prueba.com';
        const password = 'Prueba2026!';

        console.log(`1. Creando usuario ${email}...`);
        const { data: au, error: ae } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: { nombres: 'UsuarioFinal', apellidos: 'Prueba' }
        });

        if (ae) {
            console.log('Auth Error (puede que ya exista):', ae.message);
        } else {
            console.log("-> Usuario Creado:", au.user.id);
        }

        console.log("2. Forzando actualización de email_confirm...");
        // Buscar usuario si ya existía
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
        const user = usersData.users.find(u => u.email === email);

        if (user) {
            const { data: upd, error: ue } = await supabaseAdmin.auth.admin.updateUserById(user.id, { email_confirm: true });
            if (ue) console.log('Update Error:', ue.message);
            else console.log('-> Estado actualizado:', upd.user.email_confirmed_at ? 'CONFIRMADO' : 'NO CONFIRMADO');
        }

        console.log("3. Intentando login por API...");
        const { data: login, error: le } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (le) {
            console.log('Login Error:', le.message);
        } else {
            console.log('✅ LOGIN SUCCESS. Access Token:', login.session.access_token.substring(0, 15) + '...');
        }
    } catch (x) {
        console.log("Fatal Error:", x);
    }
    process.exit(0);
}

testRoutine();
