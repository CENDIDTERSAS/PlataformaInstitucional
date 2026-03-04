const express = require('express');
const router = express.Router();
const { supabase } = require('../db');

router.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        const user = data.user;

        const { data: profile, error: profileError } = await supabase
            .from('perfiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
        }

        try {
            await supabase.from('notificaciones').insert([{
                tipo: 'LOGIN',
                titulo: 'Inicio de Sesión',
                mensaje: `El usuario ${profile?.nombres || user.email} ha ingresado a la plataforma.`,
                solo_admin: true,
                usuario_id: user.id,
                datos: { ip: req.ip, user_agent: req.headers['user-agent'] }
            }]);
        } catch (notifErr) {
            console.error('Error al registrar notificación de login:', notifErr);
        }

        res.json({
            user,
            profile: profile || null
        });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

module.exports = router;
