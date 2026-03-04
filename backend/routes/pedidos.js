const express = require('express');
const router = express.Router();
const { supabase } = require('../db');

// GET todos los pedidos
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('pedidos_proveedor')
            .select(`
                *,
                proveedores (nombre, nit, direccion, email, telefono)
            `)
            .order('creado_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST crear pedido
router.post('/', async (req, res) => {
    try {
        const { codigo, items, usuario_id, proveedor_id } = req.body;
        const { data, error } = await supabase
            .from('pedidos_proveedor')
            .insert([{
                codigo,
                items,
                usuario_id,
                proveedor_id,
                estado: 'Generado'
            }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
