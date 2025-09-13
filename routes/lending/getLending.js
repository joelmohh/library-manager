
const express = require('express');
const Router = express.Router();

const Lending = require('../../models/Lending');
const { adminOnly } = require('../../modules/verify');
// Contagem total de empréstimos
Router.get('/count', adminOnly, async (req, res) => {
    try {
        const total = await Lending.countDocuments();
        res.status(200).json({ total });
    } catch (error) {
        console.error('Erro ao contar empréstimos:', error.message);
        res.status(500).json({ message: 'Não foi possível contar os empréstimos.' });
    }
});
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


// Buscar todos os livros emprestados de um usuário específico

const { isLoggedIn } = require('../../modules/verify');

// Histórico do próprio usuário (aluno/professor)
Router.get('/my-history', isLoggedIn, async (req, res) => {
    try {
        const userId = req.session.userId;
        const lendings = await Lending.find({ user: userId }).populate('book');
        res.status(200).json(lendings);
    } catch (error) {
        console.error('Erro ao buscar histórico do usuário:', error.message);
        res.status(500).json({ message: 'Não foi possível buscar o histórico do usuário.' });
    }
});

// Consulta de empréstimos de qualquer usuário (admin)
Router.get('/user/:userId', adminOnly, async (req, res) => {
    const { userId } = req.params;
    try {
        const lendings = await Lending.find({ user: userId }).populate('book');
        res.status(200).json(lendings);
    } catch (error) {
        console.error('Erro ao buscar empréstimos do usuário:', error.message);
        res.status(500).json({ message: 'Não foi possível buscar os empréstimos do usuário.' });
    }
});

module.exports = Router;