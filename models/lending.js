const mongoose = require('mongoose');

const lendingSchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: [true, 'Referência do livro é obrigatória']
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Referência do estudante é obrigatória']
    },
    // Campos desnormalizados para performance (evita joins desnecessários)
    bookTitle: {
        type: String,
        required: [true, 'Título do livro é obrigatório']
    },
    studentName: {
        type: String,
        required: [true, 'Nome do estudante é obrigatório']
    },
    studentClass: {
        type: String,
        required: [true, 'Turma do estudante é obrigatória']
    },
    lendingDate: {
        type: Date,
        required: [true, 'Data de empréstimo é obrigatória'],
        default: Date.now
    },
    expectedReturnDate: {
        type: Date,
        required: [true, 'Data prevista de devolução é obrigatória']
    },
    actualReturnDate: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: {
            values: ['active', 'returned', 'overdue', 'lost'],
            message: 'Status deve ser active, returned, overdue ou lost'
        },
        default: 'active'
    },
    notes: {
        type: String,
        maxlength: [500, 'Observações não podem exceder 500 caracteres'],
        trim: true
    },
    lendingUser: {  // Usuário que fez o empréstimo (bibliotecário)
        type: String,
        required: [true, 'Usuário responsável pelo empréstimo é obrigatório']
    },
    returnUser: {   // Usuário que processou a devolução
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Índices para otimização
lendingSchema.index({ book: 1 });
lendingSchema.index({ student: 1 });
lendingSchema.index({ status: 1 });
lendingSchema.index({ lendingDate: -1 });
lendingSchema.index({ expectedReturnDate: 1 });
lendingSchema.index({ status: 1, expectedReturnDate: 1 }); // Composto para consultas de atraso

// Virtual para verificar se está em atraso
lendingSchema.virtual('isOverdue').get(function() {
    return this.status === 'active' && 
           this.expectedReturnDate && 
           new Date() > this.expectedReturnDate;
});

// Virtual para calcular dias de empréstimo
lendingSchema.virtual('daysLent').get(function() {
    const endDate = this.actualReturnDate || new Date();
    const startDate = this.lendingDate;
    return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
});

// Virtual para calcular dias de atraso
lendingSchema.virtual('daysOverdue').get(function() {
    if (this.status !== 'active' || !this.expectedReturnDate) {
        return 0;
    }
    const today = new Date();
    const expectedReturn = this.expectedReturnDate;
    if (today > expectedReturn) {
        return Math.ceil((today - expectedReturn) / (1000 * 60 * 60 * 24));
    }
    return 0;
});

// Middleware para atualizar status automaticamente
lendingSchema.pre('save', function(next) {
    // Atualizar status para overdue se necessário
    if (this.status === 'active' && this.isOverdue) {
        this.status = 'overdue';
    }
    
    // Se está sendo devolvido, definir data de devolução
    if (this.status === 'returned' && !this.actualReturnDate) {
        this.actualReturnDate = new Date();
    }
    
    next();
});

// Método estático para encontrar empréstimos em atraso
lendingSchema.statics.findOverdue = function() {
    return this.find({
        status: 'active',
        expectedReturnDate: { $lt: new Date() }
    });
};

// Método para processar devolução
lendingSchema.methods.processReturn = function(returnUser) {
    this.status = 'returned';
    this.actualReturnDate = new Date();
    this.returnUser = returnUser;
    return this.save();
};

module.exports = mongoose.model('Lending', lendingSchema);