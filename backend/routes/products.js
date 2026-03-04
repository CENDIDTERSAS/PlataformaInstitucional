const express = require('express');
const router = express.Router();
const { supabase } = require('../db');

// POST importación masiva de productos
router.post('/import', async (req, res) => {
    try {
        const { products } = req.body;
        const results = { success: [], errors: [] };

        const { data: bodegas, error: bodegasError } = await supabase
            .from('bodegas')
            .select('id, nombre');

        if (bodegasError) throw bodegasError;

        for (const productData of products) {
            try {
                let bodega = bodegas.find(b => b.nombre === (productData.bodega || 'Principal'));
                if (!bodega) bodega = bodegas[0];

                const { error: insertError } = await supabase
                    .from('inventario')
                    .insert({
                        nombre: productData.nombre,
                        categoria: productData.categoria || 'General',
                        cantidad: parseFloat(productData.cantidad) || 0,
                        precio_unitario: parseFloat(productData.precio_unitario) || 0,
                        bodega_id: bodega.id,
                        ubicacion: productData.ubicacion || null,
                        descripcion: productData.descripcion || null
                    });

                if (insertError) throw insertError;
                results.success.push({ nombre: productData.nombre });
            } catch (error) {
                results.errors.push({ nombre: productData.nombre, error: error.message });
            }
        }
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
