const express = require('express');
const router = express.Router();

const Book = require('../../models/Book');

router.get('/', async (req, res) => {
    try {
        const books = await Book.find();
        res.status(200).json(books);
    } catch (error) {
    console.error('Erro ao buscar livros:', error.message);
    res.status(500).json({ message: 'Não foi possível buscar os livros.' });
    }
});

router.get('/search', async (req, res) => {
    const { title: query } = req.query;
    try {
        const books = await Book.find({ title: new RegExp(query, 'i') });
        res.status(200).json(books);
    } catch (error) {
    console.error('Erro ao buscar livros por título:', error.message);
    res.status(500).json({ message: 'Não foi possível buscar livros por título.' });
    }
});

router.get('/:page/:limit', async (req, res) => {
    const { page, limit } = req.params;
    try {
        const books = await Book.find()
            .skip((page - 1) * limit)
            .limit(limit);
        res.status(200).json(books);
    } catch (error) {
    console.error('Erro ao buscar livros por página:', error.message);
    res.status(500).json({ message: 'Não foi possível buscar livros por página.' });
    }
});


module.exports = router;