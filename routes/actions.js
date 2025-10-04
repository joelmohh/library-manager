const express = require('express');
const router = express.Router();

const Actions = require('../models/Actions');
const { adminOnly } = require('../modules/verify');

// Lista as últimas 100 ações do sistema
router.get('/', adminOnly, async (req, res) => {
    try {
        // Buscar ações e filtrar apenas as que têm data válida
        const actions = await Actions.find({ 
            date: { $exists: true, $ne: null } 
        }).sort({ date: -1 }).limit(100);
        
        res.status(200).json(actions);
    } catch (error) {
        console.error('Erro ao buscar ações:', error.message);
        res.status(500).json({ message: 'Não foi possível buscar as ações.' });
    }
});

// Rota para limpar registros órfãos (sem data válida)
router.delete('/cleanup', adminOnly, async (req, res) => {
    try {
        const result = await Actions.deleteMany({
            $or: [
                { date: { $exists: false } },
                { date: null },
                { date: "" }
            ]
        });
        
        res.status(200).json({ 
            message: `${result.deletedCount} registros órfãos removidos da auditoria.`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Erro ao limpar registros órfãos:', error.message);
        res.status(500).json({ message: 'Não foi possível limpar os registros órfãos.' });
    }
});

module.exports = router;
