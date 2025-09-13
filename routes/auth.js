const express = require('express');
const router = express.Router();

const { isLoggedIn, loginRedirect, adminOnly } = require('../modules/verify');

const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

const User = require('../models/User');

router.post('/login', loginRedirect, async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.find({ username });

        if (user.length === 0) {
            return res.status(401).json({ message: 'Usuário ou senha inválidos' });
        }   
        const passwordMatch = await bcrypt.compare(password, user[0].password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Usuário ou senha inválidos' });
        }

        req.session.userId = user[0]._id;
        req.session.username = user[0].username;
        req.session.type = user[0].type;

        res.status(200).json({ message: 'Login bem-sucedido' });
    } catch (error) {
    console.error('Erro no login:', error.message);
    res.status(500).json({ message: 'Não foi possível realizar o login.' });
    }
});

router.post('/register', adminOnly, async (req, res) => {
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

router.post('/reset-password', isLoggedIn, async (req, res) => {
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