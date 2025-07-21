// Configurações e constantes da aplicação

module.exports = {
    // Configurações de paginação
    PAGINATION: {
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100,
        BOOKS_LIMIT: 50,
        ACTIONS_LIMIT: 100,
        PUBLIC_LIMIT: 20
    },
    
    // Status dos livros
    BOOK_STATUS: {
        AVAILABLE: 0,
        BORROWED: 1
    },
    
    // Status dos empréstimos
    LENDING_STATUS: {
        ACTIVE: 'active',
        RETURNED: 'returned',
        OVERDUE: 'overdue',
        LOST: 'lost'
    },
    
    // Tipos de usuário
    USER_ROLES: {
        ADMIN: 'admin',
        STUDENT: 'student',
        TEACHER: 'teacher'
    },
    
    // Tipos de ação para log
    ACTION_TYPES: {
        CREATE: 'create',
        UPDATE: 'update',
        DELETE: 'delete',
        VIEW: 'view',
        LOGIN: 'login',
        LOGOUT: 'logout'
    },
    
    // Alvos de ação para log
    ACTION_TARGETS: {
        BOOK: 'book',
        USER: 'user',
        LENDING: 'lending',
        SYSTEM: 'system'
    },
    
    // Configurações de segurança
    SECURITY: {
        BCRYPT_ROUNDS: 12,
        SESSION_MAX_AGE: 1000 * 60 * 60 * 24 * 7, // 7 dias
        RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutos
        RATE_LIMIT_MAX: 100,
        LOGIN_RATE_LIMIT_MAX: 5
    },
    
    // Mensagens de erro padrão
    ERROR_MESSAGES: {
        INVALID_CREDENTIALS: 'Usuário ou senha incorretos',
        UNAUTHORIZED: 'Acesso não autorizado',
        NOT_FOUND: 'Recurso não encontrado',
        VALIDATION_ERROR: 'Dados inválidos fornecidos',
        INTERNAL_ERROR: 'Erro interno do servidor',
        RATE_LIMIT: 'Muitas tentativas. Tente novamente mais tarde.'
    },
    
    // Configurações de validação
    VALIDATION: {
        NAME_MIN_LENGTH: 2,
        NAME_MAX_LENGTH: 100,
        TITLE_MIN_LENGTH: 2,
        TITLE_MAX_LENGTH: 200,
        PASSWORD_MIN_LENGTH: 6,
        CLASS_MAX_LENGTH: 10,
        CATEGORY_MAX_LENGTH: 50,
        RA_MIN_LENGTH: 5,
        RA_MAX_LENGTH: 20
    }
};
