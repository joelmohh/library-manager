const mongoose = require('mongoose');

const actionsSchema = new mongoose.Schema({
    action: {
        type: String,
        required: [true, 'Descrição da ação é obrigatória'],
        trim: true,
        maxlength: [200, 'Descrição da ação não pode exceder 200 caracteres']
    },
    actionTarget: {  // Padronizado para camelCase
        type: String,
        required: [true, 'Alvo da ação é obrigatório'],
        enum: {
            values: ['book', 'user', 'lending', 'system'],
            message: 'Alvo deve ser book, user, lending ou system'
        }
    },
    actionType: {    // Padronizado para camelCase
        type: String,
        required: [true, 'Tipo da ação é obrigatório'],
        enum: {
            values: ['create', 'update', 'delete', 'view', 'login', 'logout'],
            message: 'Tipo deve ser create, update, delete, view, login ou logout'
        }
    },
    actionDate: {    // Padronizado para camelCase
        type: Date,
        required: [true, 'Data da ação é obrigatória'],
        default: Date.now
    },
    user: {
        type: String,
        required: [true, 'Usuário é obrigatório'],
        trim: true,
        maxlength: [100, 'Nome do usuário não pode exceder 100 caracteres']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false  // Opcional para compatibilidade com sistema atual
    },
    targetId: {      // ID do objeto afetado (livro, usuário, empréstimo)
        type: String,
        required: false
    },
    details: {       // Detalhes adicionais da ação (JSON)
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ipAddress: {
        type: String,
        maxlength: [45, 'IP não pode exceder 45 caracteres']  // IPv6 support
    },
    userAgent: {
        type: String,
        maxlength: [500, 'User Agent não pode exceder 500 caracteres']
    }
}, {
    timestamps: true
});

// Índices para otimização de consultas
actionsSchema.index({ actionDate: -1 });
actionsSchema.index({ user: 1, actionDate: -1 });
actionsSchema.index({ actionTarget: 1, actionType: 1 });
actionsSchema.index({ userId: 1, actionDate: -1 });
actionsSchema.index({ targetId: 1, actionDate: -1 });

// Método estático para criar log de ação
actionsSchema.statics.createLog = async function(actionData) {
    try {
        const action = new this({
            action: actionData.action,
            actionTarget: actionData.actionTarget,
            actionType: actionData.actionType,
            user: actionData.user,
            userId: actionData.userId,
            targetId: actionData.targetId,
            details: actionData.details || {},
            ipAddress: actionData.ipAddress,
            userAgent: actionData.userAgent
        });
        
        return await action.save();
    } catch (error) {
        console.error('Erro ao criar log de ação:', error);
        // Não falha a operação principal se o log falhar
        return null;
    }
};

// Método estático para buscar ações por usuário
actionsSchema.statics.findByUser = function(userId, limit = 50) {
    return this.find({ userId })
               .sort({ actionDate: -1 })
               .limit(limit)
               .lean();
};

// Método estático para buscar ações recentes
actionsSchema.statics.findRecent = function(limit = 10) {
    return this.find({})
               .sort({ actionDate: -1 })
               .limit(limit)
               .lean();
};

// Virtual para formatar data em português
actionsSchema.virtual('formattedDate').get(function() {
    return this.actionDate.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
});

module.exports = mongoose.model('Action', actionsSchema);