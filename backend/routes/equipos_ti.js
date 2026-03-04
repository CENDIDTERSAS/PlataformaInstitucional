const express = require('express');
const router = express.Router();
const { supabase } = require('../db');

// GET todos los equipos TI
router.get('/', async (req, res) => {
    try {
        const { tipo, estado } = req.query;
        let query = supabase.from('equipos_ti').select('*').order('nombre', { ascending: true });
        if (tipo) query = query.eq('tipo', tipo);
        if (estado) query = query.eq('estado', estado);
        const { data, error } = await query;
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET un equipo TI por id
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('equipos_ti')
            .select('*')
            .eq('id', req.params.id)
            .single();
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST crear equipo TI
router.post('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('equipos_ti')
            .insert([{ ...req.body, creado_at: new Date().toISOString() }])
            .select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT actualizar equipo TI
router.put('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('equipos_ti')
            .update({ ...req.body, actualizado_at: new Date().toISOString() })
            .eq('id', req.params.id)
            .select();
        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE equipo TI
router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('equipos_ti').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
