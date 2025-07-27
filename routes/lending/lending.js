// 
// This file is equivalent of /api/lending route 
//
const express = require('express');
const Router = express.Router();

const Lending = require('../../models/Lending');

Router.post('/add', async (req, res) => {
    const { book, user, startDate, endDate } = req.body;

    try {
        const newLending = new Lending({ book, user, startDate, endDate });
        await newLending.save();
        res.status(201).json(newLending);
    } catch (error) {
        console.error('Erro ao criar empréstimo:', error);
        res.status(500).json({ message: 'Erro ao criar empréstimo' });
    }
});

Router.post('/remove/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const lending = await Lending.findById(id);
        lending.status = 'returned';
        await lending.save();
        res.status(200).json({ message: 'Empréstimo devolvido com sucesso' });

    } catch (error) {
        console.error('Erro ao devolver empréstimo:', error);
        res.status(500).json({ message: 'Erro ao devolver empréstimo' });
    }
});

Router.post('/extend/:id', async (req, res) => {
    const { id } = req.params;
    const { newEndDate } = req.body;

    try {
        const lending = await Lending.findById(id);
        lending.endDate = newEndDate;
        await lending.save();
        res.status(200).json({ message: 'Empréstimo estendido com sucesso' });

    } catch (error) {
        console.error('Erro ao estender empréstimo:', error);
        res.status(500).json({ message: 'Erro ao estender empréstimo' });
    }
});

module.exports = Router;