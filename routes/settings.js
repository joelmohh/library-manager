const express = require('express');
const bcrypt = require('bcrypt');
const { isLoggedIn } = require('../modules/verify');
const User = require('../models/User');
const router = express.Router();

// GET - Página de configurações
router.get('/', isLoggedIn, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        res.render('admin_settings', { 
            page: { title: 'Configurações' },
            user: user || {
                id: req.session.userId || 'unknown',
                username: req.session.username || 'Usuario',
                email: '',
                fullName: req.session.username || 'Usuario'
            }
        });
    } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        res.render('admin_settings', { 
            page: { title: 'Configurações' },
            user: {
                id: req.session.userId || 'unknown',
                username: req.session.username || 'Usuario',
                email: '',
                fullName: req.session.username || 'Usuario'
            }
        });
    }
});

// PUT - Atualizar perfil do usuário
router.put('/profile', isLoggedIn, async (req, res) => {
    try {
        const { fullName, email, username, currentPassword, newPassword } = req.body;
        const userId = req.session.userId;

        // Buscar usuário atual
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
        }

        // Verificar senha atual se uma nova senha foi fornecida
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Senha atual é obrigatória para alterar a senha' 
                });
            }

            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Senha atual incorreta' 
                });
            }
        }

        // Verificar se email já existe (se foi alterado)
        if (email !== user.email) {
            const existingEmailUser = await User.findOne({ email, _id: { $ne: userId } });
            if (existingEmailUser) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Este email já está sendo usado por outro usuário' 
                });
            }
        }

        // Verificar se username já existe (se foi alterado)
        if (username !== user.username) {
            const existingUsernameUser = await User.findOne({ username, _id: { $ne: userId } });
            if (existingUsernameUser) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Este nome de usuário já está sendo usado' 
                });
            }
        }

        // Preparar dados para atualização
        const updateData = {
            fullName: fullName || user.fullName,
            email: email || user.email,
            username: username || user.username
        };

        // Adicionar nova senha se fornecida
        if (newPassword) {
            const saltRounds = 12;
            updateData.password = await bcrypt.hash(newPassword, saltRounds);
        }

        // Atualizar usuário
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

        // Atualizar sessão (seguindo o padrão da aplicação)
        if (username && username !== req.session.username) {
            req.session.username = updatedUser.username;
        }

        res.json({ 
            success: true, 
            message: 'Perfil atualizado com sucesso',
            user: {
                fullName: updatedUser.fullName,
                email: updatedUser.email,
                username: updatedUser.username
            }
        });

    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

module.exports = router;