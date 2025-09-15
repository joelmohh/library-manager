const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const { isLoggedIn, loginRedirect, adminOnly } = require('../modules/verify');

const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

const User = require('../models/User');

router.post('/login', [
    body('username')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Nome de usuário é obrigatório'),
    body('password')
        .isLength({ min: 1 })
        .withMessage('Senha é obrigatória')
], loginRedirect, async (req, res) => {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            message: 'Dados inválidos',
            errors: errors.array()
        });
    }

    const { username, password } = req.body;

    try {
        console.log('Tentativa de login para:', username);
        
        const user = await User.find({ username });

        if (user.length === 0) {
            console.log('Usuário não encontrado:', username);
            return res.status(401).json({ message: 'Usuário ou senha inválidos' });
        }   
        
        console.log('Usuário encontrado, verificando senha...');
        const passwordMatch = await bcrypt.compare(password, user[0].password);
        if (!passwordMatch) {
            console.log('Senha incorreta para usuário:', username);
            return res.status(401).json({ message: 'Usuário ou senha inválidos' });
        }

        console.log('Login bem-sucedido para:', username);
        req.session.userId = user[0]._id;
        req.session.username = user[0].username;
        req.session.type = user[0].type;

        res.status(200).json({ 
            message: 'Login bem-sucedido',
            userType: user[0].type 
        });
    } catch (error) {
    console.error('Erro no login:', error.message);
    res.status(500).json({ message: 'Não foi possível realizar o login.' });
    }
});

router.post('/register', [
    body('username')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Nome de usuário deve ter entre 3 e 50 caracteres')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Nome de usuário deve conter apenas letras, números e underscore'),
    body('fullName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Nome completo deve ter entre 2 e 100 caracteres'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email inválido'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Senha deve ter pelo menos 6 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
    body('type')
        .isIn(['admin', 'student', 'teacher'])
        .withMessage('Tipo de usuário inválido')
], adminOnly, async (req, res) => {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            message: 'Dados inválidos',
            errors: errors.array()
        });
    }

    const { username, fullName, password, email, type } = req.body;
    try {
        const existingUser = await User.find({ username });
        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'Nome de usuário já existe' });
        }
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const newUser = new User({ username, fullName, email, password: hashedPassword, type });
        await newUser.save();
        res.status(201).json({ message: 'Usuário registrado com sucesso' });
    } catch (error) {
    console.error('Erro no registro:', error.message);
    res.status(500).json({ message: 'Não foi possível realizar o registro.' });
    }
});

router.post('/exit', isLoggedIn, async (req, res) => {
    req.session = null;
    res.status(200).json({ message: 'Logout bem-sucedido' });
});

router.post('/reset-password', [
    body('currentPassword')
        .isLength({ min: 6 })
        .withMessage('Senha atual é obrigatória'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('Nova senha deve ter pelo menos 6 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Nova senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número')
], isLoggedIn, async (req, res) => {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            message: 'Dados inválidos',
            errors: errors.array()
        });
    }

    const { currentPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Senha atual incorreta' });
        }
        const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        user.password = hashedNewPassword;
        await user.save();
        res.status(200).json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
    console.error('Erro ao alterar senha:', error.message);
    res.status(500).json({ message: 'Não foi possível alterar a senha.' });
    }
});


module.exports = router;