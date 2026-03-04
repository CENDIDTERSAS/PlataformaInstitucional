const express = require('express');
const router = express.Router();
const { supabase } = require('../db');

// GET repuestos por equipo o mantenimiento
router.get('/', async (req, res) => {
    try {
        const { equipo_id, mantenimiento_id } = req.query;
        let query = supabase.from('repuestos_equipos').select('*');

        if (equipo_id) query = query.eq('equipo_id', equipo_id);
        if (mantenimiento_id) query = query.eq('mantenimiento_id', mantenimiento_id);

        const { data, error } = await query.order('creado_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST registrar repuesto
router.post('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('repuestos_equipos')
            .insert([req.body])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT actualizar estado de repuesto
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('repuestos_equipos')
            .update({ ...req.body, actualizado_at: new Date().toISOString() })
            .eq('id', id)
            .select();
        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
