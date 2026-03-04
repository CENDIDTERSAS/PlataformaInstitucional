const express = require('express');
const router = express.Router();
const { supabase } = require('../db');

// GET contratos
router.get('/', async (req, res) => {
    try {
        const { equipo_id, equipo_ids } = req.query;
        let query = supabase
            .from('contratos_biomedicos')
            .select('*, proveedores(nombre), contrato_vinculos_equipos(count)');

        if (equipo_id || equipo_ids) {
            const idList = equipo_ids ? equipo_ids.split(',') : [equipo_id];

            // Buscamos contratos vinculados a estos equipos en la tabla intermedia
            const { data: vinculos } = await supabase
                .from('contrato_vinculos_equipos')
                .select('contrato_id')
                .in('equipo_id', idList);

            const contratoIdsList = vinculos ? vinculos.map(v => v.contrato_id) : [];

            // Filtramos por contrato global (nulo), equipo_id directo o por estar en la lista de vínculos 
            const conditions = [
                'equipo_id.is.null',
                ...idList.map(id => `equipo_id.eq.${id}`),
                ...(contratoIdsList.length > 0 ? [`id.in.(${contratoIdsList.join(',')})`] : [])
            ];

            query = query.or(conditions.join(','));
        }

        const { data, error } = await query.order('creado_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST crear contrato con múltiples equipos
router.post('/', async (req, res) => {
    try {
        const { equipo_ids, ...contratoData } = req.body;

        // 1. Insertar el contrato
        const { data: contrato, error: contratoError } = await supabase
            .from('contratos_biomedicos')
            .insert([contratoData])
            .select()
            .single();

        if (contratoError) throw contratoError;

        // 2. Si hay equipos vinculados, insertar en la tabla intermedia
        if (equipo_ids && equipo_ids.length > 0) {
            const vinculos = equipo_ids.map(eid => ({
                contrato_id: contrato.id,
                equipo_id: eid
            }));

            const { error: vinculoError } = await supabase
                .from('contrato_vinculos_equipos')
                .insert(vinculos);

            if (vinculoError) throw vinculoError;
        }

        res.status(201).json(contrato);
    } catch (error) {
        console.error('Error al crear contrato:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
