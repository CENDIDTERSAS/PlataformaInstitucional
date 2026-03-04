const express = require('express');
const router = express.Router();
const { supabase } = require('../db');

// GET todos los equipos
router.get('/', async (req, res) => {
    try {
        const { ids } = req.query;
        let query = supabase
            .from('equipos_biomedicos')
            .select('*, bodegas(id, nombre)');

        if (ids) {
            const idList = ids.split(',');
            query = query.in('id', idList);
        }

        const { data, error } = await query.order('creado_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST crear equipo
router.post('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('equipos_biomedicos')
            .insert([req.body])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT actualizar equipo
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            actualizado_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('equipos_biomedicos')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE eliminar equipo
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('equipos_biomedicos')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Equipo eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
