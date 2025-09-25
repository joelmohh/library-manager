const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const Book = require('../../models/Book');
const Actions = require('../../models/Actions');
const { adminOnly } = require('../../modules/verify');

router.post('/add', [
    body('title')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Título deve ter entre 1 e 200 caracteres'),
    body('author')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Autor deve ter entre 1 e 100 caracteres'),
    body('editor')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Editora deve ter entre 1 e 100 caracteres'),
    body('isbn')
        .trim()
        .matches(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/)
        .withMessage('ISBN inválido')
], adminOnly, async (req, res) => {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            message: 'Dados inválidos',
            errors: errors.array()
        });
    }

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
        
        // Verificar se é erro de ISBN duplicado
        if (error.code === 11000 && error.keyPattern && error.keyPattern.isbn) {
            return res.status(400).json({ 
                message: 'Este ISBN já está cadastrado no sistema',
                error: 'duplicate_isbn'
            });
        }
        
        res.status(500).json({ message: 'Erro interno do servidor ao adicionar livro' });
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