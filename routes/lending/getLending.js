const express = require('express');
const Router = express.Router();

const Lending = require('../../models/Lending');

Router.get('/:page/:limit', async (req, res) => {
    const { page, limit } = req.params;
    const skip = (page - 1) * limit;

    try {
        const lendings = await Lending.find().populate('book user').skip(skip).limit(limit);
        res.status(200).json(lendings);
    } catch (error) {
        console.error('Erro ao buscar empréstimos:', error);
        res.status(500).json({ message: 'Erro ao buscar empréstimos' });
    }
});

Router.get('/search', async (req, res) => {
    const { query } = req.query;

    try {
        const lendings = await Lending.find({ $or: [
            { book: { $regex: query, $options: 'i' } },
            { user: { $regex: query, $options: 'i' } }
        ]}).populate('book user');
        res.status(200).json(lendings);
    } catch (error) {
        console.error('Erro ao buscar empréstimos:', error);
        res.status(500).json({ message: 'Erro ao buscar empréstimos' });
    }
});

module.exports = Router;