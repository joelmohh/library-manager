
const Router = require('express').Router();

const User = require('../../models/User');
const { adminOnly, isLoggedIn } = require('../../modules/verify');

// Rota para obter dados do usuário atual (DEVE vir antes da rota /:id)
Router.get('/me', isLoggedIn, async (req, res) => {
    try {
        const userId = req.session.userId;
        
        if (!userId) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }
        
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        
        res.status(200).json(user);
    } catch (error) {
        console.error('Erro ao obter dados do usuário:', error.message);
        res.status(500).json({ message: 'Não foi possível obter os dados do usuário.' });
    }
});

// Endpoint simples para obter todos os usuários
Router.get('/', adminOnly, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({
            success: true,
            users: users
        });
    } catch (error) {
        console.error('Erro ao buscar usuários:', error.message);
        res.status(500).json({ message: 'Não foi possível buscar os usuários.' });
    }
});

// Contagem total de usuários
Router.get('/count', adminOnly, async (req, res) => {
    try {
        const type = req.query.type;
        let total;
        if (type) {
            total = await User.countDocuments({ type });
        } else {
            total = await User.countDocuments();
        }
        res.status(200).json({ total });
    } catch (error) {
        console.error('Erro ao contar usuários:', error.message);
        res.status(500).json({ message: 'Não foi possível contar os usuários.' });
    }
});
Router.get('/:page/:limit', adminOnly, async (req, res) => {
    const { page, limit } = req.params;
    const { type } = req.query;

    try {
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        
        const filter = type ? { type } : {};
        const users = await User.find(filter)
            .select('-password')
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);

        const total = await User.countDocuments(filter);
        const lastPage = Math.ceil(total / limitNum);

        res.json({
            users: users,
            total: total,
            page: pageNum,
            lastPage: lastPage,
            hasNext: pageNum < lastPage,
            hasPrev: pageNum > 1
        });
    } catch (error) {
        console.error('Erro ao buscar usuários:', error.message);
        res.status(500).json({ message: 'Não foi possível buscar os usuários.' });
    }
});

Router.get('/search', adminOnly, async (req, res) => {
    const { q: query, type } = req.query;

    try {
        let searchFilter = {
            $or: [
                { fullName: { $regex: query, $options: 'i' } },
                { username: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        };

        // Adicionar filtro por tipo se fornecido
        if (type) {
            searchFilter = {
                $and: [
                    searchFilter,
                    { type: type }
                ]
            };
        }

        const users = await User.find(searchFilter).select('-password');

        res.json({
            users: users,
            total: users.length,
            page: 1,
            lastPage: 1
        });
    } catch (error) {
        console.error('Erro ao buscar usuários:', error.message);
        res.status(500).json({ message: 'Não foi possível buscar os usuários.' });
    }
});

Router.get('/:id', adminOnly, async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
    console.error('Erro ao buscar usuário por ID:', error.message);
    res.status(500).json({ message: 'Não foi possível buscar o usuário.' });
    }
});

module.exports = Router;