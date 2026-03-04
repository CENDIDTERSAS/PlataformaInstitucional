const express = require('express');
const router = express.Router();
const { supabase } = require('../db');

// GET todas las bodegas
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('bodegas')
            .select('*')
            .order('creado_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST crear bodega
router.post('/', async (req, res) => {
    try {
        const { nombre, ubicacion, estado } = req.body;
        const { data, error } = await supabase
            .from('bodegas')
            .insert([{ nombre, ubicacion, estado: estado || 'Activa' }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET asignaciones de usuarios
router.get('/:id/assignments', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('perfiles_bodegas')
            .select('perfil_id')
            .eq('bodega_id', id);

        if (error) {
            console.warn('⚠️ perfiles_bodegas no disponible aún:', error.message);
            return res.json([]);
        }
        res.json(data.map(a => a.perfil_id));
    } catch (error) {
        console.error('❌ Error en bodegas/assignments:', error);
        res.json([]);
    }
});

// POST actualizar asignaciones
router.post('/:id/assignments', async (req, res) => {
    try {
        const { id } = req.params;
        const { usuarios_ids } = req.body;

        await supabase.from('perfiles_bodegas').delete().eq('bodega_id', id);

        if (usuarios_ids && usuarios_ids.length > 0) {
            const inserts = usuarios_ids.map(uid => ({ perfil_id: uid, bodega_id: id }));
            const { error } = await supabase.from('perfiles_bodegas').insert(inserts);
            if (error) throw error;
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT actualizar bodega
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, ubicacion, estado } = req.body;
        const { data, error } = await supabase
            .from('bodegas')
            .update({ nombre, ubicacion, estado, actualizado_at: new Date().toISOString() })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE eliminar bodega
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('bodegas')
            .delete()
            .eq('id', id);

        if (error) {
            if (error.code === '23503') {
                return res.status(400).json({ error: 'No se puede eliminar la bodega porque tiene productos asociados.' });
            }
            throw error;
        }
        res.json({ message: 'Bodega eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
