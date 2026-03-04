const express = require('express');
const router = express.Router();
const { supabase } = require('../db');

router.get('/', async (req, res) => {
    try {
        const { equipo_ti_id } = req.query;
        let q = supabase.from('software_ti').select('*').order('nombre');
        if (equipo_ti_id) q = q.eq('equipo_ti_id', equipo_ti_id);
        const { data, error } = await q;
        if (error) throw error;
        res.json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
    try {
        const { data, error } = await supabase.from('software_ti').insert([req.body]).select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase.from('software_ti').update(req.body).eq('id', req.params.id).select();
        if (error) throw error;
        res.json(data[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('software_ti').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
