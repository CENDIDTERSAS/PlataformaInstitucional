const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../db');

// GET todos los usuarios
router.get('/', async (req, res) => {
    try {
        const { data: perfiles, error } = await supabase
            .from('perfiles')
            .select('*');

        if (error) throw error;

        // Obtener correos y metadatos desde Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        if (authError) throw authError;

        // Combinar datos de perfiles con email de autenticación
        const usersWithEmails = perfiles.map(perfil => {
            const authUser = authData.users.find(u => u.id === perfil.id);
            return {
                ...perfil,
                email: authUser ? authUser.email : null
            };
        });

        res.json(usersWithEmails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST crear usuario individual
router.post(['/', ''], async (req, res) => {
    try {
        const userData = req.body;

        // Asignar email por defecto o usar el proporcionado
        const email = userData.email || `${userData.nombres}.${userData.apellidos}@temp.com`.toLowerCase().replace(/ /g, '');
        // Generar contraseña segura aleatoria (o usar la proporcionada por el Admin)
        const password = userData.password || (Math.random().toString(36).slice(-8) + 'A1!');

        // 1. Crear el usuario en auth.users
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: password,
            email_confirm: true,
            user_metadata: { nombres: userData.nombres, apellidos: userData.apellidos }
        });

        if (authError) throw authError;

        // 2. Crear el perfil correspondiente en perfiles
        const { error: profileError } = await supabase
            .from('perfiles')
            .insert({
                id: authUser.user.id,
                nombres: userData.nombres,
                apellidos: userData.apellidos,
                identificacion: userData.identificacion || null,
                dependencia: userData.dependencia || null,
                cargo: userData.cargo || null,
                rol: userData.rol || 'Colaborador',
                estado: userData.estado || 'Activo'
            });

        if (profileError) throw profileError;

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            email: email,
            password: password, // Se envía la contraseña temporal al request de creación
            user: {
                id: authUser.user.id,
                nombres: userData.nombres,
                apellidos: userData.apellidos,
                rol: userData.rol || 'Colaborador'
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT actualizar usuario
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombres, apellidos, dependencia, cargo, rol, estado, firma_url, foto_url, identificacion } = req.body;

        // Protección de administrador principal
        const { data: userAuth } = await supabaseAdmin.auth.admin.getUserById(id);
        if (userAuth?.user?.email === 'ricardosolarte.08@gmail.com') {
            return res.status(403).json({ error: 'El perfil del administrador principal no puede ser modificado por otros.' });
        }

        const { data, error } = await supabase
            .from('perfiles')
            .update({
                nombres,
                apellidos,
                dependencia,
                cargo,
                rol,
                estado,
                firma_url,
                foto_url,
                identificacion,
                actualizado_at: new Date().toISOString()
            })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE eliminar usuario
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Protección de administrador principal
        const { data: userAuth } = await supabaseAdmin.auth.admin.getUserById(id);
        if (userAuth?.user?.email === 'ricardosolarte.08@gmail.com') {
            return res.status(403).json({ error: 'El administrador principal no puede ser eliminado.' });
        }

        // Eliminar desde Auth (eliminará en perfiles automáticamente por CASCADE)
        const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

        if (error) throw error;
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST cambiar contraseña
router.post('/:id/change-password', async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        // Protección de administrador principal
        const { data: userAuth } = await supabaseAdmin.auth.admin.getUserById(id);
        if (userAuth?.user?.email === 'ricardosolarte.08@gmail.com') {
            return res.status(403).json({ error: 'La contraseña del administrador principal no puede ser modificada.' });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        const { error } = await supabaseAdmin.auth.admin.updateUserById(id, { password: password });

        if (error) throw error;
        res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PATCH alternar estado
router.patch('/:id/toggle-status', async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        // Protección de administrador principal
        const { data: userAuth } = await supabaseAdmin.auth.admin.getUserById(id);
        if (userAuth?.user?.email === 'ricardosolarte.08@gmail.com') {
            return res.status(403).json({ error: 'El administrador principal no puede ser modificado.' });
        }

        const { data, error } = await supabase
            .from('perfiles')
            .update({ estado, actualizado_at: new Date() })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST importación masiva
router.post('/import', async (req, res) => {
    try {
        const { users } = req.body;
        const results = { success: [], errors: [] };

        for (const userData of users) {
            try {
                const email = userData.email || `${userData.nombres}.${userData.apellidos}@temp.com`.toLowerCase().replace(/ /g, '');
                const temporaryPassword = Math.random().toString(36).slice(-8) + 'A1!';

                const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                    email,
                    password: temporaryPassword,
                    email_confirm: true,
                    user_metadata: { nombres: userData.nombres, apellidos: userData.apellidos }
                });

                if (authError) throw authError;

                const { error: profileError } = await supabase
                    .from('perfiles')
                    .insert({
                        id: authUser.user.id,
                        nombres: userData.nombres,
                        apellidos: userData.apellidos,
                        identificacion: userData.identificacion || null,
                        dependencia: userData.dependencia || null,
                        cargo: userData.cargo || null,
                        rol: userData.rol || 'Colaborador',
                        estado: 'Activo'
                    });

                if (profileError) throw profileError;
                results.success.push({ email, password: temporaryPassword });
            } catch (error) {
                results.errors.push({ email: userData.email, error: error.message });
            }
        }
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET asignaciones de bodegas
router.get('/:id/assignments', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('perfiles_bodegas')
            .select('bodega_id')
            .eq('perfil_id', id);

        if (error) {
            console.warn('⚠️ Nota: Funcionalidad de asignaciones no disponible aún:', error.message);
            return res.json([]);
        }
        res.json(data.map(a => a.bodega_id));
    } catch (error) {
        console.error('❌ Error en GET /assignments:', error);
        res.json([]);
    }
});

// POST actualizar asignaciones
router.post('/:id/assignments', async (req, res) => {
    try {
        const { id } = req.params;
        const { bodegas_ids } = req.body;

        await supabase.from('perfiles_bodegas').delete().eq('perfil_id', id);

        if (bodegas_ids && bodegas_ids.length > 0) {
            const inserts = bodegas_ids.map(bid => ({ perfil_id: id, bodega_id: bid }));
            const { error } = await supabase.from('perfiles_bodegas').insert(inserts);
            if (error) throw error;
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET permisos
router.get('/:id/permissions', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('permisos_modulos')
            .select('modulo, accion')
            .eq('perfil_id', id);

        if (error) {
            console.warn('⚠️ Nota: Funcionalidad de permisos no disponible aún:', error.message);
            return res.json([]);
        }
        res.json(data);
    } catch (error) {
        console.error('❌ Error en GET /permissions:', error);
        res.json([]);
    }
});

// POST actualizar permisos
router.post('/:id/permissions', async (req, res) => {
    try {
        const { id } = req.params;
        const { permisos } = req.body;

        await supabaseAdmin.from('permisos_modulos').delete().eq('perfil_id', id);

        if (permisos && permisos.length > 0) {
            const inserts = permisos.map(p => ({ perfil_id: id, modulo: p.modulo, accion: p.accion }));
            const { error } = await supabaseAdmin.from('permisos_modulos').insert(inserts);
            if (error) throw error;
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
