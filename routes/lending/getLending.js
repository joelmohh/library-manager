
const express = require('express');
const Router = express.Router();

const Lending = require('../../models/Lending');
const { adminOnly, isLoggedIn } = require('../../modules/verify');

// Rota padrão para /api/lending - lista todos os empréstimos com paginação padrão
Router.get('/', isLoggedIn, async (req, res) => {
    try {
        // Se for admin, mostra todos os empréstimos
        if (req.session.userType === 'admin') {
            const lendings = await Lending.find().populate('book user').limit(20).sort({ startDate: -1 });
            res.status(200).json({ success: true, lendings: lendings });
        } else {
            // Se for usuário comum, mostra apenas seus empréstimos
            const userId = req.session.userId;
            const lendings = await Lending.find({ user: userId }).populate('book').sort({ startDate: -1 });
            res.status(200).json({ success: true, lendings: lendings });
        }
    } catch (error) {
        console.error('Erro ao buscar empréstimos:', error.message);
        res.status(500).json({ success: false, message: 'Não foi possível buscar os empréstimos.' });
    }
});

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

// Rota de paginação para lending
Router.get('/:page/:limit', adminOnly, async (req, res) => {
    const { page, limit } = req.params;
    const { status } = req.query;

    try {
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        
        // Build filter object
        let filter = {};
        if (status !== undefined && status !== '') {
            filter.status = status;
        }
        
        // Count total documents with filter
        const total = await Lending.countDocuments(filter);
        
        // Get lendings for current page with filter
        const lendings = await Lending.find(filter)
            .populate('book user')
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .sort({ startDate: -1 });
            
        // Calculate pagination info
        const lastPage = Math.ceil(total / limitNum);
        
        res.status(200).json({
            lendings: lendings,
            total: total,
            page: pageNum,
            lastPage: lastPage,
            hasNext: pageNum < lastPage,
            hasPrev: pageNum > 1
        });
    } catch (error) {
        console.error('Erro ao buscar empréstimos por página:', error.message);
        res.status(500).json({ message: 'Não foi possível buscar empréstimos por página.' });
    }
});

// Rota de busca para lending
Router.get('/search', adminOnly, async (req, res) => {
    const { q: query } = req.query;

    try {
        const lendings = await Lending.find()
            .populate({
                path: 'user',
                match: {
                    $or: [
                        { fullName: { $regex: query, $options: 'i' } },
                        { username: { $regex: query, $options: 'i' } },
                        { email: { $regex: query, $options: 'i' } }
                    ]
                }
            })
            .populate({
                path: 'book',
                match: {
                    $or: [
                        { title: { $regex: query, $options: 'i' } },
                        { author: { $regex: query, $options: 'i' } }
                    ]
                }
            })
            .sort({ startDate: -1 });

        // Filter out lendings where neither user nor book matched
        const filteredLendings = lendings.filter(lending => lending.user || lending.book);

        res.json({
            lendings: filteredLendings,
            total: filteredLendings.length,
            page: 1,
            lastPage: 1
        });
    } catch (error) {
        console.error('Erro ao buscar empréstimos:', error.message);
        res.status(500).json({ message: 'Não foi possível buscar os empréstimos.' });
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

// Buscar empréstimo específico por ID
Router.get('/:id', adminOnly, async (req, res) => {
    const { id } = req.params;

    try {
        // Validar se o ID é um ObjectId válido
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'ID inválido' });
        }

        const lending = await Lending.findById(id).populate('book user');
        if (!lending) {
            return res.status(404).json({ message: 'Empréstimo não encontrado' });
        }
        res.json(lending);
    } catch (error) {
        console.error('Erro ao buscar empréstimo por ID:', error.message);
        res.status(500).json({ message: 'Não foi possível buscar o empréstimo.' });
    }
});

module.exports = Router;