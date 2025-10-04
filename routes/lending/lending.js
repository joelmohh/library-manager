// 
// This file is equivalent of /api/lending route 
//
const express = require('express');
const Router = express.Router();

const Lending = require('../../models/Lending');
const Book = require('../../models/Book');
const Actions = require('../../models/Actions');
const { adminOnly } = require('../../modules/verify');

// Rota de teste para verificar se a API está funcionando
Router.get('/test', (req, res) => {
    res.json({ status: 'API lending funcionando', timestamp: new Date() });
});

// Rota de teste com autenticação admin
Router.get('/test-admin', adminOnly, (req, res) => {
    res.json({ status: 'API lending com admin funcionando', user: req.session.username, timestamp: new Date() });
});

Router.post('/add', adminOnly, async (req, res) => {
    const { book, user, startDate, endDate } = req.body;

    try {
        const newLending = new Lending({ book, user, startDate, endDate });
        await newLending.save();

        const bookDoc = await Book.findById(book);
        bookDoc.available = false;
        await bookDoc.save();

        const  actionLog = new Actions({
            description: `Empréstimo criado: Livro ID ${book} para Usuário ID ${user}`,
            author: req.session.username,
            action: 'added'
        });
        await actionLog.save();
        res.status(201).json({status: 'success', data :{newLending}});
    } catch (error) {
    console.error('Erro ao criar empréstimo:', error.message);
    res.status(500).json({ message: 'Não foi possível criar o empréstimo.' });
    }
});

Router.post('/remove/:id', adminOnly, async (req, res) => {
    const { id } = req.params;
    try {
        const lending = await Lending.findById(id);
        if (!lending) {
            return res.status(404).json({ message: 'Empréstimo não encontrado' });
        }
        
        lending.status = 'returned';
        await lending.save();

        const bookDoc = await Book.findById(lending.book);
        if (bookDoc) {
            bookDoc.available = true;
            await bookDoc.save();
        }

        res.status(200).json({ message: 'Empréstimo devolvido com sucesso' });
        const actionLog = new Actions({
            description: `Empréstimo devolvido: ID ${id}`,
            author: req.session.username,
            action: 'removed'
        });
        await actionLog.save();
    } catch (error) {
    console.error('Erro ao devolver empréstimo:', error.message);
    res.status(500).json({ message: 'Não foi possível devolver o empréstimo.' });
    }
});

// Alias para compatibilidade com o frontend
Router.post('/return/:id', adminOnly, async (req, res) => {
    const { id } = req.params;
    try {
        const lending = await Lending.findById(id);
        if (!lending) {
            return res.status(404).json({ message: 'Empréstimo não encontrado' });
        }
        
        lending.status = 'returned';
        await lending.save();

        const bookDoc = await Book.findById(lending.book);
        if (bookDoc) {
            bookDoc.available = true;
            await bookDoc.save();
        }

        res.status(200).json({ message: 'Empréstimo devolvido com sucesso' });
        const actionLog = new Actions({
            description: `Empréstimo devolvido: ID ${id}`,
            author: req.session.username,
            action: 'removed'
        });
        await actionLog.save();
    } catch (error) {
    console.error('Erro ao devolver empréstimo:', error.message);
    res.status(500).json({ message: 'Não foi possível devolver o empréstimo.' });
    }
});

Router.post('/extend/:id', adminOnly, async (req, res) => {
    const { id } = req.params;
    const { newEndDate } = req.body;

    try {
        const lending = await Lending.findById(id);
        lending.endDate = newEndDate;
        await lending.save();
        res.status(200).json({ message: 'Empréstimo estendido com sucesso' });
        const actionLog = new Actions({
            description: `Empréstimo estendido: ID ${id} até ${newEndDate}`,
            author: req.session.username,
            action: 'updated'
        });
        await actionLog.save();

    } catch (error) {
    console.error('Erro ao estender empréstimo:', error.message);
    res.status(500).json({ message: 'Não foi possível estender o empréstimo.' });
    }
});

Router.post('/delete/:id', adminOnly, async (req, res) => {
    const { id } = req.params;
    try {
        const lending = await Lending.findById(id);
        
        // Verificar se o empréstimo está ativo antes de permitir exclusão
        if (lending.status === 'active') {
            // Se estiver ativo, devolver o livro primeiro
            const bookDoc = await Book.findById(lending.book);
            if (bookDoc) {
                bookDoc.available = true;
                await bookDoc.save();
            }
        }
        
        // Remover completamente o empréstimo
        await Lending.findByIdAndDelete(id);
        
        res.status(200).json({ message: 'Empréstimo removido com sucesso' });
        
        const actionLog = new Actions({
            description: `Empréstimo removido permanentemente: ID ${id}`,
            author: req.session.username,
            action: 'deleted'
        });
        await actionLog.save();
    } catch (error) {
        console.error('Erro ao remover empréstimo:', error.message);
        res.status(500).json({ message: 'Não foi possível remover o empréstimo.' });
    }
});

module.exports = Router;