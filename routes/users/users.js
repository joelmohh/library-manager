const Router = require('express').Router();
const bcrypt = require('bcrypt');

const User = require('../../models/User');
const Actions = require('../../models/Actions');
const { adminOnly, isLoggedIn } = require('../../modules/verify');

const SALT_ROUNDS = 10;

// Rota para atualizar perfil do usuário
Router.post('/update-profile', async (req, res) => {
    try {
        const userId = req.session.userId;
        const { username, fullName, email } = req.body;
        
        if (!userId) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        // Verificar se o email já existe (exceto para o próprio usuário)
        const existingUser = await User.findOne({ 
            email: email, 
            _id: { $ne: userId } 
        });
        
        if (existingUser) {
            return res.status(400).json({ message: 'Este email já está em uso por outro usuário.' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { username, fullName, email },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        res.status(200).json(updatedUser);
        
        const actionLog = new Actions({
            description: `Perfil atualizado: ${username} (ID: ${userId})`,
            author: req.session.username,
            action: 'updated'
        });
        await actionLog.save();
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error.message);
        res.status(500).json({ message: 'Não foi possível atualizar o perfil.' });
    }
});

// Rota para alterar senha
Router.post('/change-password', async (req, res) => {
    try {
        const userId = req.session.userId;
        const { currentPassword, newPassword } = req.body;
        
        if (!userId) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        // Verificar senha atual
        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Senha atual incorreta.' });
        }

        // Hash da nova senha
        const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        
        await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

        res.status(200).json({ message: 'Senha alterada com sucesso!' });
        
        const actionLog = new Actions({
            description: `Senha alterada para usuário: ${user.username} (ID: ${userId})`,
            author: req.session.username,
            action: 'updated'
        });
        await actionLog.save();
    } catch (error) {
        console.error('Erro ao alterar senha:', error.message);
        res.status(500).json({ message: 'Não foi possível alterar a senha.' });
    }
});

Router.post('/add', adminOnly, async (req, res) => {
    const { username, fullName, email, password, type } = req.body;

    try {
        // Hash da senha antes de salvar
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        
        const user = new User({
            username,
            fullName,
            email,
            password: hashedPassword,
            type
        });
        await user.save();
        
        // Remover a senha do objeto de retorno
        const userResponse = user.toObject();
        delete userResponse.password;
        
        res.status(201).json(userResponse);
        
        const actionLog = new Actions({
            description: `Usuário adicionado: ${username}`,
            author: req.session.username,
            action: 'added'
        });
        await actionLog.save();
    } catch (error) {
        console.error('Erro ao adicionar usuário:', error.message);
        
        // Verificar tipo específico de erro
        if (error.code === 11000) {
            // Erro de duplicação
            if (error.keyPattern && error.keyPattern.email) {
                return res.status(400).json({ message: 'Já existe um usuário com este email.' });
            } else if (error.keyPattern && error.keyPattern.username) {
                return res.status(400).json({ message: 'Já existe um usuário com este nome de usuário.' });
            } else {
                return res.status(400).json({ message: 'Dados duplicados. Verifique email e nome de usuário.' });
            }
        } else if (error.name === 'ValidationError') {
            // Erro de validação
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: `Dados inválidos: ${messages.join(', ')}` });
        }
        
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
        // Verificar se o email já existe (exceto para o próprio usuário)
        const existingUser = await User.findOne({ 
            email: email, 
            _id: { $ne: id } 
        });
        
        if (existingUser) {
            return res.status(400).json({ message: 'Este email já está em uso por outro usuário.' });
        }

        const updateData = {
            username,
            fullName,
            email,
            type
        };

        // Só atualiza a senha se ela foi fornecida
        if (password && password.trim() !== '') {
            updateData.password = await bcrypt.hash(password, SALT_ROUNDS);
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        
        // Remover a senha do objeto de retorno
        const userResponse = updatedUser.toObject();
        delete userResponse.password;
        
        res.status(200).json(userResponse);
        
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

// Rota para resetar senha de usuário (admin)
Router.post('/reset-password/:id', adminOnly, async (req, res) => {
    const { id } = req.params;

    try {
        // Gerar nova senha temporária
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, SALT_ROUNDS);

        const user = await User.findByIdAndUpdate(
            id, 
            { password: hashedPassword }, 
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        res.status(200).json({ 
            message: 'Senha resetada com sucesso!',
            tempPassword: tempPassword,
            username: user.username
        });

        const actionLog = new Actions({
            description: `Senha resetada para usuário: ${user.username} (ID: ${id})`,
            author: req.session.username,
            action: 'updated'
        });
        await actionLog.save();

    } catch (error) {
        console.error('Erro ao resetar senha:', error.message);
        res.status(500).json({ message: 'Não foi possível resetar a senha.' });
    }
});

module.exports = Router;   
