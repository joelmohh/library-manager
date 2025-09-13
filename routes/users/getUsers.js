
const Router = require('express').Router();

const User = require('../../models/User');
const { adminOnly } = require('../../modules/verify');
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

    try {
        const users = await User.find()
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await User.countDocuments();

        res.json({
            users,
            total,
            page: Number(page),
            lastPage: Math.ceil(total / limit)
        });
    } catch (error) {
    console.error('Erro ao buscar usuários:', error.message);
    res.status(500).json({ message: 'Não foi possível buscar os usuários.' });
    }
});

Router.get('/search', adminOnly,  async (req, res) => {
    const { query } = req.query;

    try {
        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        });

        res.json(users);
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