const express = require('express');
const router = express.Router();

const Book = require('../../models/Book');

router.post('/add', async (req, res) => {
    const { title, author, editor, isbn } = req.body;

    try {
        const newBook = new Book({ title, author, editor, isbn });
        await newBook.save();
        res.status(201).json(newBook);
    } catch (error) {
        console.error('Erro ao adicionar livro:', error);
        res.status(500).json({ message: 'Erro ao adicionar livro' });
    }
});

router.post('/remove/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await Book.findByIdAndDelete(id);
        res.status(200).json({ message: 'Livro removido com sucesso' });
    } catch (error) {
        console.error('Erro ao remover livro:', error);
        res.status(500).json({ message: 'Erro ao remover livro' });
    }
});

router.post('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { title, author, editor, isbn } = req.body;

    try {
        const updatedBook = await Book.findByIdAndUpdate(id, { title, author, editor, isbn }, { new: true });
        res.status(200).json(updatedBook);
    } catch (error) {
        console.error('Erro ao atualizar livro:', error);
        res.status(500).json({ message: 'Erro ao atualizar livro' });
    }
});

module.exports = router;