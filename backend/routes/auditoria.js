const express = require('express');
const router = express.Router();
const { supabase } = require('../db');

// GET bitácora de auditoría
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('auditoria')
            .select('*')
            .order('fecha', { ascending: false })
            .limit(100);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
