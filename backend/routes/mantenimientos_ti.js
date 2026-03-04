const express = require('express');
const router = express.Router();
const { supabase } = require('../db');

// GET mantenimientos de un equipo TI
router.get('/', async (req, res) => {
    try {
        const { equipo_ti_id, anio } = req.query;
        let q = supabase.from('mantenimientos_ti').select('*').order('fecha_programada');
        if (equipo_ti_id) q = q.eq('equipo_ti_id', equipo_ti_id);
        if (anio) q = q.eq('anio', anio);
        const { data, error } = await q;
        if (error) throw error;
        res.json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST crear mantenimiento
router.post('/', async (req, res) => {
    try {
        const { data, error } = await supabase.from('mantenimientos_ti').insert([req.body]).select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST generar los 4 mantenimientos de un año para un equipo
router.post('/generar', async (req, res) => {
    try {
        const { equipo_ti_id, anio } = req.body;
        if (!equipo_ti_id || !anio) return res.status(400).json({ error: 'equipo_ti_id y anio son requeridos' });

        // Trimestres: Enero, Abril, Julio, Octubre
        const meses = [1, 4, 7, 10];
        const registros = meses.map((mes, i) => ({
            equipo_ti_id,
            numero_mantenimiento: i + 1,
            anio,
            fecha_programada: `${anio}-${String(mes).padStart(2, '0')}-15`,
            estado: 'Pendiente',
            tipo: 'Preventivo'
        }));

        const { data, error } = await supabase.from('mantenimientos_ti').insert(registros).select();
        if (error) throw error;
        res.status(201).json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT actualizar mantenimiento (marcar realizado, agregar técnico, etc.)
router.put('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('mantenimientos_ti').update(req.body).eq('id', req.params.id).select();
        if (error) throw error;
        res.json(data[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('mantenimientos_ti').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
