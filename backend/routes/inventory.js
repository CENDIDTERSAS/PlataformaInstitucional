const express = require('express');
const router = express.Router();
const { supabase } = require('../db');

// GET todos los productos
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('inventario')
            .select('*, bodegas(id, nombre)')
            .order('creado_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST crear producto
router.post('/', async (req, res) => {
    try {
        const { nombre, descripcion, categoria, bodega_id } = req.body;
        if (!nombre || !bodega_id) return res.status(400).json({ error: 'Nombre y Bodega son obligatorios' });

        const { data, error } = await supabase
            .from('inventario')
            .insert([{ nombre, descripcion, categoria, bodega_id }])
            .select('*, bodegas(id, nombre)');

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT actualizar producto
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, categoria, bodega_id } = req.body;

        const { data, error } = await supabase
            .from('inventario')
            .update({
                nombre,
                descripcion,
                categoria,
                bodega_id,
                actualizado_at: new Date().toISOString()
            })
            .eq('id', id)
            .select('*, bodegas(id, nombre)');

        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE eliminar producto
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('inventario')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
