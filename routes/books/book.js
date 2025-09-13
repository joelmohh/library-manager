const express = require('express');
const router = express.Router();

const Book = require('../../models/Book');
const Actions = require('../../models/Actions');
const { adminOnly } = require('../../modules/verify');

router.post('/add', adminOnly, async (req, res) => {
    const { title, author, editor, isbn } = req.body;

    try {
        const newBook = new Book({ title, author, editor, isbn });
        await newBook.save();
        res.status(201).json(newBook);

        const actionLog = new Actions({
            description: `Livro adicionado: ${title}`,
            author: req.session.username,
            action: 'added'
        });
        await actionLog.save();
    } catch (error) {
        console.error('Erro ao adicionar livro:', error);
        res.status(500).json({ message: 'Erro ao adicionar livro' });
    }
});

router.post('/remove/:id', adminOnly, async (req, res) => {
    const { id } = req.params;

    try {
        await Book.findByIdAndDelete(id);
        res.status(200).json({ message: 'Livro removido com sucesso' });
         const actionLog = new Actions({
            description: `Livro removido: ID ${id}`,
            author: req.session.username,
            action: 'removed'
        });
        await actionLog.save();
    } catch (error) {
        console.error('Erro ao remover livro:', error);
        res.status(500).json({ message: 'Erro ao remover livro' });
    }
});

router.post('/update/:id', adminOnly, async (req, res) => {
    const { id } = req.params;
    const { title, author, editor, isbn } = req.body;

    try {
        const updatedBook = await Book.findByIdAndUpdate(id, { title, author, editor, isbn }, { new: true });
        res.status(200).json(updatedBook);
            const actionLog = new Actions({
            description: `Livro atualizado: ${title} (ID: ${id})`,
            author: req.session.username,
            action: 'updated'
        });
        await actionLog.save();
    } catch (error) {
        console.error('Erro ao atualizar livro:', error);
        res.status(500).json({ message: 'Erro ao atualizar livro' });
    }
});

module.exports = router;