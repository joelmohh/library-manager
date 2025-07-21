const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nome é obrigatório'],
        trim: true,
        minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
        maxlength: [100, 'Nome não pode exceder 100 caracteres']
    },
    username: {  // Padronizado para username em vez de email
        type: String,
        required: function() { 
            return this.role === 'admin' || this.role === 'teacher'; 
        },
        unique: true,
        sparse: true,
        trim: true,
        lowercase: true,
        maxlength: [100, 'Username não pode exceder 100 caracteres']
    },
    password: {
        type: String,
        required: function() { 
            return this.role === 'admin' || this.role === 'teacher'; 
        },
        minlength: [6, 'Senha deve ter pelo menos 6 caracteres']
    },
    class: {
        type: String,
        required: [true, 'Turma é obrigatória'],
        trim: true,
        maxlength: [10, 'Turma não pode exceder 10 caracteres']
    },
    role: {
        type: String,
        enum: {
            values: ['admin', 'student', 'teacher'],
            message: 'Role deve ser admin, student ou teacher'
        },
        default: 'student'
    },
    ra: {
        type: String,
        required: function() { 
            return this.role === 'student'; 
        },
        unique: true,
        sparse: true,
        trim: true,
        maxlength: [20, 'RA não pode exceder 20 caracteres'],
        default: function() {
            return this.role === 'teacher' ? null : undefined;
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Middleware para hash da senha antes de salvar
userSchema.pre('save', async function(next) {
    // Só faz hash se a senha foi modificada
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    
    try {
        const saltRounds = 12;
        this.password = await bcrypt.hash(this.password, saltRounds);
        next();
    } catch (error) {
        next(error);
    }
});

// Método para comparar senha
userSchema.methods.comparePassword = async function(candidatePassword) {
    if (!this.password) {
        return false;
    }
    return bcrypt.compare(candidatePassword, this.password);
};

// Método para obter dados seguros do usuário (sem senha)
userSchema.methods.toSafeObject = function() {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

// Índices para otimização
userSchema.index({ username: 1 });
userSchema.index({ ra: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);