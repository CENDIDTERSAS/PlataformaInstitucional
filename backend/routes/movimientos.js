const express = require('express');
const router = express.Router();
const { supabase } = require('../db');

// GET todos los movimientos
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('movimientos')
            .select(`
                *,
                inventario (nombre, codigo),
                bodegas (nombre),
                pedidos_proveedor (codigo),
                proveedores (nombre),
                perfiles:destinatario_id (nombres, apellidos)
            `)
            .order('fecha', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('❌ Error en GET /api/movimientos:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST crear múltiples movimientos (recepción masiva)
router.post('/bulk', async (req, res) => {
    try {
        const { movimientos, pedido_id, proveedor_id } = req.body;
        console.log('📥 PETICIÓN BULK RECIBIDA:', {
            totalMovimientos: movimientos?.length,
            pedido_id,
            proveedor_id,
            primerItem: movimientos?.[0] || 'VACÍO'
        });

        const movesWithProvider = movimientos.map(m => ({
            ...m,
            proveedor_id: proveedor_id || m.proveedor_id || null,
            nombre_item: m.nombre_item // Aseguramos que pase el nombre para la notificación
        }));

        const { data: moves, error: moveError } = await supabase
            .from('movimientos')
            .insert(movesWithProvider)
            .select();

        if (moveError) {
            console.error('❌ ERROR INSERTANDO MOVIMIENTOS BULK:', moveError);
            throw moveError;
        }

        if (pedido_id) {
            const { error: patchError } = await supabase
                .from('pedidos_proveedor')
                .update({ estado: 'Recibido Total' })
                .eq('id', pedido_id);

            if (patchError) console.error('⚠️ Error actualizando estado de pedido:', patchError);

            // Notificación consolidada de recepción
            try {
                const { data: provData } = await supabase
                    .from('proveedores')
                    .select('nombre')
                    .eq('id', proveedor_id)
                    .single();

                const { data: pedidoData } = await supabase
                    .from('pedidos_proveedor')
                    .select('codigo')
                    .eq('id', pedido_id)
                    .single();

                const listaProductos = movesWithProvider.map(m => {
                    // Intentar obtener el nombre del producto de los movimientos si está disponible, 
                    // o usar un placeholder si no lo tenemos en el objeto local
                    return m.nombre_item || 'Producto registrado';
                }).join(', ');

                await supabase.from('notificaciones').insert([{
                    tipo: 'C_PRODUCTO',
                    titulo: '📦 Mercancía Recibida',
                    mensaje: `Se ha recibido mercancía del proveedor ${provData?.nombre || 'Desconocido'} correspondiente al oficio ${pedidoData?.codigo || pedido_id}. Productos: ${listaProductos}.`,
                    solo_admin: true
                }]);
            } catch (notifErr) {
                console.error('⚠️ Error al generar notificación de recepción:', notifErr);
            }
        }

        res.status(201).json({
            message: 'Recepción masiva completada exitosamente',
            count: moves?.length || 0,
            data: moves
        });
    } catch (error) {
        console.error('❌ Fallo crítico en /bulk:', error.message);
        res.status(500).json({ error: error.message, details: 'Error al procesar carga masiva de inventario' });
    }
});

// POST crear movimiento
router.post('/', async (req, res) => {
    try {
        const {
            item_id,
            bodega_id,
            tipo,
            cantidad,
            responsable,
            notas,
            pedido_id,
            proveedor_id,
            destinatario_id,
            valor_unitario,
            subtotal,
            iva_porcentaje,
            valor_total
        } = req.body;

        const { data, error } = await supabase
            .from('movimientos')
            .insert([{
                item_id,
                bodega_id,
                tipo,
                cantidad,
                responsable,
                notas,
                pedido_id: pedido_id || null,
                proveedor_id: proveedor_id || null,
                destinatario_id: destinatario_id || null,
                valor_unitario: valor_unitario || 0,
                subtotal: subtotal || 0,
                iva_porcentaje: iva_porcentaje || 0,
                valor_total: valor_total || 0
            }])
            .select();

        if (error) throw error;

        if (pedido_id) {
            await supabase
                .from('pedidos_proveedor')
                .update({ estado: 'Recibido Total' })
                .eq('id', pedido_id);
        }

        res.status(201).json(data[0]);
    } catch (error) {
        console.error('❌ Error en POST /api/movimientos:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
