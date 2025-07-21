const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const User = require('../models/user');
const Action = require('../models/actions');
const { validateLogin } = require('../middleware/validation');
const { logAction } = require('../utils/helpers');

// Rate limiting para login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 tentativas por IP
    message: {
        success: false,
        error: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/login', loginLimiter, validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Buscar usuário pelo username
        const user = await User.findOne({ 
            username: email.toLowerCase().trim(),
            isActive: true 
        });

        if (!user) {
            // Log da tentativa de login falhada
            await Action.createLog({
                action: `Tentativa de login com email não encontrado: ${email}`,
                actionTarget: 'system',
                actionType: 'login',
                user: email,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });

            logAction('LOGIN_FAILED', { email, reason: 'User not found', ip: req.ip });
            return res.status(401).json({
                success: false,
                error: 'Usuário ou senha incorretos'
            });
        }

        // Verificar senha com hash
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            // Log da tentativa de login com senha incorreta
            await Action.createLog({
                action: `Tentativa de login com senha incorreta`,
                actionTarget: 'user',
                actionType: 'login',
                user: user.name,
                userId: user._id,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });

            logAction('LOGIN_FAILED', { 
                email, 
                userId: user._id.toString(), 
                reason: 'Invalid password', 
                ip: req.ip 
            });

            return res.status(401).json({
                success: false,
                error: 'Usuário ou senha incorretos'
            });
        }

        // Login bem-sucedido - configurar sessão
        req.session.userId = user._id;
        req.session.username = user.username;
        req.session.name = user.name;
        req.session.role = user.role;

        // Log do login bem-sucedido
        await Action.createLog({
            action: `Login realizado com sucesso`,
            actionTarget: 'user',
            actionType: 'login',
            user: user.name,
            userId: user._id,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        logAction('LOGIN_SUCCESS', { 
            userId: user._id.toString(), 
            username: user.username, 
            ip: req.ip 
        });

        // Resposta baseada no tipo de requisição
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json({
                success: true,
                message: 'Login realizado com sucesso',
                user: user.toSafeObject(),
                redirectUrl: '/dash'
            });
        } else {
            return res.redirect('/dash');
        }

    } catch (error) {
        logAction('LOGIN_ERROR', { error: error.message, ip: req.ip });
        console.error('Erro no login:', error);
        
        return res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

router.get('/logout', async (req, res) => {
    try {
        // Log do logout se houver usuário logado
        if (req.session.userId) {
            await Action.createLog({
                action: `Logout realizado`,
                actionTarget: 'user',
                actionType: 'logout',
                user: req.session.name,
                userId: req.session.userId,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });

            logAction('LOGOUT', { 
                userId: req.session.userId.toString(), 
                username: req.session.username 
            });
        }

        // Destruir sessão
        req.session = null;

        // Resposta baseada no tipo de requisição
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json({
                success: true,
                message: 'Logout realizado com sucesso',
                redirectUrl: '/'
            });
        } else {
            return res.redirect('/');
        }

    } catch (error) {
        logAction('LOGOUT_ERROR', { error: error.message });
        console.error('Erro no logout:', error);
        
        // Mesmo com erro, fazer logout local
        req.session = null;
        return res.redirect('/');
    }
});

module.exports = router;