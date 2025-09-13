const express = require('express');
const router = express.Router();

const Actions = require('../models/Actions');
const { adminOnly } = require('../modules/verify');

// Lista as últimas 100 ações do sistema
router.get('/', adminOnly, async (req, res) => {
    try {
        const actions = await Actions.find().sort({ createdAt: -1 }).limit(100);
        res.status(200).json(actions);
    } catch (error) {
        console.error('Erro ao buscar ações:', error.message);
        res.status(500).json({ message: 'Não foi possível buscar as ações.' });
    }
});

module.exports = router;
