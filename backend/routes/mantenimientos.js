const express = require('express');
const router = express.Router();
const { supabase } = require('../db');

// GET mantenimientos (puede filtrarse por equipo_id)
router.get('/', async (req, res) => {
    try {
        const { equipo_id, equipo_ids } = req.query;
        let query = supabase
            .from('mantenimientos_equipos')
            .select(`
                *,
                equipos_biomedicos (nombre, codigo_inventario),
                contratos_biomedicos (numero_contrato)
            `)
            .order('fecha_ejecucion', { ascending: false });

        if (equipo_id) {
            query = query.eq('equipo_id', equipo_id);
        }

        if (equipo_ids) {
            const idList = equipo_ids.split(',');
            query = query.in('equipo_id', idList);
        }

        const { data, error } = await query;
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST crear mantenimiento
router.post('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('mantenimientos_equipos')
            .insert([req.body])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT actualizar mantenimiento
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('mantenimientos_equipos')
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
