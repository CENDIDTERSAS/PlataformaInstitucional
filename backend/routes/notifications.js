const express = require('express');
const router = express.Router();
const { supabase } = require('../db');

// GET notificaciones filtradas
router.get('/', async (req, res) => {
    try {
        const { rol, dependencia } = req.query;
        let query = supabase
            .from('notificaciones')
            .select('*')
            .order('creado_at', { ascending: false });

        if (rol !== 'Administrador') {
            if (dependencia) {
                query = query.or(`dependencia_destino.eq.${dependencia},dependencia_destino.is.null`);
            }
            query = query.eq('solo_admin', false);
        }

        const { data, error } = await query.limit(50);
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST crear notificación manual
router.post('/', async (req, res) => {
    try {
        const { tipo, titulo, mensaje, dependencia_destino, solo_admin, usuario_id, datos } = req.body;
        const { data, error } = await supabase
            .from('notificaciones')
            .insert([{ tipo, titulo, mensaje, dependencia_destino, solo_admin, usuario_id, datos }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
