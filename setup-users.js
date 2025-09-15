// Script para criar usuário administrador de teste
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('./models/User');

async function createAdminUser() {
    try {
        // Conectar ao banco
        await mongoose.connect(process.env.DB_URL);
        console.log('Conectado ao banco de dados');

        // Verificar se já existe um admin
        const existingAdmin = await User.findOne({ type: 'admin' });
        if (existingAdmin) {
            console.log('Usuário admin já existe:', existingAdmin.username);
            process.exit(0);
        }

        // Criar hash da senha
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Criar usuário admin
        const adminUser = new User({
            username: 'admin',
            fullName: 'Administrador do Sistema',
            email: 'admin@biblioteca.com',
            password: hashedPassword,
            type: 'admin'
        });

        await adminUser.save();
        console.log('✅ Usuário administrador criado com sucesso!');
        console.log('Username: admin');
        console.log('Senha: admin123');

        // Criar um usuário estudante de teste
        const studentPassword = await bcrypt.hash('student123', 10);
        const studentUser = new User({
            username: 'estudante',
            fullName: 'Estudante Teste',
            email: 'estudante@teste.com',
            password: studentPassword,
            type: 'student'
        });

        await studentUser.save();
        console.log('✅ Usuário estudante criado com sucesso!');
        console.log('Username: estudante');
        console.log('Senha: student123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao criar usuários:', error);
        process.exit(1);
    }
}

createAdminUser();