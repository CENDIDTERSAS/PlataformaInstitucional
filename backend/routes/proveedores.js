const express = require('express');
const router = express.Router();
const { supabase } = require('../db');

// GET todos los proveedores
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('proveedores')
            .select('*')
            .order('nombre', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST crear proveedor
router.post('/', async (req, res) => {
    try {
        const { nombre, nit, direccion, telefono, email, departamento, ciudad } = req.body;
        const { data, error } = await supabase
            .from('proveedores')
            .insert([{ nombre, nit, direccion, telefono, email, departamento, ciudad }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT actualizar proveedor
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, nit, direccion, telefono, email, departamento, ciudad } = req.body;
        const { data, error } = await supabase
            .from('proveedores')
            .update({ nombre, nit, direccion, telefono, email, departamento, ciudad })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE eliminar proveedor
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('proveedores')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Proveedor eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
