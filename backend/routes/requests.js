const express = require('express');
const router = express.Router();
const { supabase } = require('../db');

// GET solicitudes
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('solicitudes_papeleria')
            .select(`
                *,
                perfiles:usuario_id (
                    nombres,
                    apellidos,
                    dependencia,
                    cargo
                )
            `)
            .order('creado_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST crear solicitud
router.post('/', async (req, res) => {
    try {
        const { usuario_id, items, motivo, prioridad, itemsRaw } = req.body;
        const { data, error } = await supabase
            .from('solicitudes_papeleria')
            .insert([{
                usuario_id,
                items: itemsRaw || items,
                motivo,
                prioridad
            }])
            .select();

        if (error) throw error;
        const newRequest = data[0];

        // Lógica de notificación consolidada por falta de stock
        if (itemsRaw && Array.isArray(itemsRaw)) {
            const itemsSinStock = [];

            for (const item of itemsRaw) {
                const { data: invData } = await supabase
                    .from('inventario')
                    .select('id, nombre')
                    .eq('nombre', item.nombre)
                    .single();

                if (invData) {
                    const { data: movs } = await supabase
                        .from('movimientos')
                        .select('tipo, cantidad')
                        .eq('item_id', invData.id);

                    const stockActual = movs ? movs.reduce((acc, m) => m.tipo === 'Entrada' ? acc + m.cantidad : acc - m.cantidad, 0) : 0;

                    if (stockActual <= 0) {
                        itemsSinStock.push(item.nombre);
                    }
                }
            }

            if (itemsSinStock.length > 0) {
                await supabase.from('notificaciones').insert([{
                    titulo: '🚨 Stock Insuficiente',
                    mensaje: `La solicitud #${newRequest.id} contiene productos sin existencias: ${itemsSinStock.join(', ')}.`,
                    tipo: 'Alerta',
                    rol_destino: 'Administrador',
                    datos: { solicitud_id: newRequest.id, items_faltantes: itemsSinStock }
                }]);
            }
        }
        res.status(201).json(newRequest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PATCH actualizar solicitud
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, responsable_entrega } = req.body;
        const updateData = { estado };

        if (estado === 'Entregada') {
            const now = new Date();
            updateData.fecha_entrega = now.toISOString();

            // Calcular SLA
            const { data: currentReq } = await supabase
                .from('solicitudes_papeleria')
                .select('creado_at, usuario_id, items')
                .eq('id', id)
                .single();

            if (currentReq) {
                // ── SLA y Registro de Entrega ──
                const creadoAt = new Date(currentReq.creado_at);
                const diffMs = now.getTime() - creadoAt.getTime();
                const diffHrs = (diffMs / (1000 * 60 * 60)).toFixed(2);
                updateData.sla_horas = parseFloat(diffHrs);

                console.log(`ℹ️ Solicitud #${id} marcada como entregada. El movimiento de inventario se procesará vía Trigger SQL.`);
            }
        }

        const { data, error } = await supabase
            .from('solicitudes_papeleria')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

