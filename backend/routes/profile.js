const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../db');

// GET perfil individual
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabaseAdmin
            .from('perfiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PATCH actualizar ultimo visto notificaciones
router.patch('/:id/read-notifications', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabaseAdmin
            .from('perfiles')
            .update({ ultimo_visto_notif: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true, message: 'Notificaciones marcadas como leídas' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
