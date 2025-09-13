const express = require('express');
const Router = express.Router();

const Lending = require('../../models/Lending');
const { adminOnly } = require('../../modules/verify');

Router.get('/:page/:limit', adminOnly, async (req, res) => {
    const { page, limit } = req.params;
    const skip = (page - 1) * limit;

    try {
        const lendings = await Lending.find().populate('book user').skip(skip).limit(limit);
        res.status(200).json(lendings);
    } catch (error) {
    console.error('Erro ao buscar empréstimos:', error.message);
    res.status(500).json({ message: 'Não foi possível buscar os empréstimos.' });
    }
});

Router.get('/search', adminOnly, async (req, res) => {
    const { query } = req.query;

    try {
        const lendings = await Lending.find({ $or: [
            { book: { $regex: query, $options: 'i' } },
            { user: { $regex: query, $options: 'i' } }
        ]}).populate('book user');
        res.status(200).json(lendings);
    } catch (error) {
    console.error('Erro ao buscar empréstimos:', error.message);
    res.status(500).json({ message: 'Não foi possível buscar os empréstimos.' });
    }
});

module.exports = Router;