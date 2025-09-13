const Router = require('express').Router();

const User = require('../../models/User');
const Actions = require('../../models/Actions');
const { adminOnly } = require('../../modules/verify');

Router.post('/add', adminOnly, async (req, res) => {
    const { username, fullName, email, password, type } = req.body;

    try {
        const user = new User({
            username,
            fullName,
            email,
            password,
            type
        });
        await user.save();
        res.status(201).json(user);
        const actionLog = new Actions({
            description: `Usuário adicionado: ${username}`,
            author: req.session.username,
            action: 'added'
        });
        await actionLog.save();
    } catch (error) {
    console.error('Erro ao adicionar usuário:', error.message);
    res.status(500).json({ message: 'Não foi possível adicionar o usuário.' });
    }
});
Router.post('/remove/:id', adminOnly, async (req, res) => {
    const { id } = req.params;

    try {
        await User.findByIdAndDelete(id);
        res.status(200).json({ message: 'User removed successfully' });
        const actionLog = new Actions({
            description: `Usuário removido: ID ${id}`,
            author: req.session.username,
            action: 'removed'
        });
        await actionLog.save(); 
    } catch (error) {
    console.error('Erro ao remover usuário:', error.message);
    res.status(500).json({ message: 'Não foi possível remover o usuário.' });
    }
});

Router.post('/update/:id', adminOnly, async (req, res) => {
    const { id } = req.params;
    const { username, fullName, email, password, type } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(id, {
            username,
            fullName,
            email,
            password,
            type
        }, { new: true });
        res.status(200).json(updatedUser);
        const actionLog = new Actions({
            description: `Usuário atualizado: ${username} (ID: ${id})`,
            author: req.session.username,
            action: 'updated'
        });
        await actionLog.save();
    } catch (error) {
    console.error('Erro ao atualizar usuário:', error.message);
    res.status(500).json({ message: 'Não foi possível atualizar o usuário.' });
    }
});

module.exports = Router;   
