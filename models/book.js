const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Título é obrigatório'],
        trim: true,
        minlength: [2, 'Título deve ter pelo menos 2 caracteres'],
        maxlength: [200, 'Título não pode exceder 200 caracteres']
    },
    author: {  // Corrigido de 'autor' para 'author' para padronizar
        type: String,
        required: [true, 'Autor é obrigatório'],
        trim: true,
        minlength: [2, 'Autor deve ter pelo menos 2 caracteres'],
        maxlength: [100, 'Autor não pode exceder 100 caracteres']
    },
    category: {
        type: String,
        required: [true, 'Categoria é obrigatória'],
        trim: true,
        minlength: [2, 'Categoria deve ter pelo menos 2 caracteres'],
        maxlength: [50, 'Categoria não pode exceder 50 caracteres']
    },
    status: {
        type: Number,
        enum: {
            values: [0, 1],
            message: 'Status deve ser 0 (disponível) ou 1 (emprestado)'
        },
        default: 0
        // 0: available (disponível)
        // 1: borrowed (emprestado)
    },
    isbn: {
        type: String,
        trim: true,
        sparse: true,
        unique: true,
        maxlength: [20, 'ISBN não pode exceder 20 caracteres']
    },
    publishYear: {
        type: Number,
        min: [1000, 'Ano deve ser válido'],
        max: [new Date().getFullYear(), 'Ano não pode ser futuro']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Índices para otimização de consultas
bookSchema.index({ title: 1 });
bookSchema.index({ author: 1 });
bookSchema.index({ category: 1 });
bookSchema.index({ status: 1 });
bookSchema.index({ title: 'text', author: 'text', category: 'text' }); // Índice de texto para busca

// Método virtual para verificar disponibilidade
bookSchema.virtual('isAvailable').get(function() {
    return this.status === 0 && this.isActive;
});

// Método para emprestar livro
bookSchema.methods.lend = function() {
    if (this.status === 1) {
        throw new Error('Livro já está emprestado');
    }
    this.status = 1;
    return this.save();
};

// Método para devolver livro
bookSchema.methods.return = function() {
    if (this.status === 0) {
        throw new Error('Livro já está disponível');
    }
    this.status = 0;
    return this.save();
};

module.exports = mongoose.model('Book', bookSchema);
