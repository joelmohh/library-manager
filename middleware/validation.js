const { body, validationResult } = require('express-validator');

// Middleware para verificar resultados da validação
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Dados inválidos',
            details: errors.array().map(err => ({
                field: err.path,
                message: err.msg,
                value: err.value
            }))
        });
    }
    next();
};

// Validações para livros
const validateBook = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Título é obrigatório')
        .isLength({ min: 2, max: 200 })
        .withMessage('Título deve ter entre 2 e 200 caracteres'),
    
    body('autor')
        .trim()
        .notEmpty()
        .withMessage('Autor é obrigatório')
        .isLength({ min: 2, max: 100 })
        .withMessage('Autor deve ter entre 2 e 100 caracteres'),
    
    body('category')
        .trim()
        .notEmpty()
        .withMessage('Categoria é obrigatória')
        .isLength({ min: 2, max: 50 })
        .withMessage('Categoria deve ter entre 2 e 50 caracteres'),
    
    handleValidation
];

// Validações para usuários
const validateUser = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Nome é obrigatório')
        .isLength({ min: 2, max: 100 })
        .withMessage('Nome deve ter entre 2 e 100 caracteres'),
    
    body('class')
        .trim()
        .notEmpty()
        .withMessage('Turma é obrigatória')
        .isLength({ min: 2, max: 10 })
        .withMessage('Turma deve ter entre 2 e 10 caracteres'),
    
    body('role')
        .optional()
        .isIn(['admin', 'student', 'teacher'])
        .withMessage('Role deve ser admin, student ou teacher'),
    
    body('ra')
        .optional()
        .trim()
        .isLength({ min: 5, max: 20 })
        .withMessage('RA deve ter entre 5 e 20 caracteres'),
    
    handleValidation
];

// Validações para login
const validateLogin = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email é obrigatório')
        .isLength({ max: 100 })
        .withMessage('Email muito longo'),
    
    body('password')
        .notEmpty()
        .withMessage('Senha é obrigatória')
        .isLength({ min: 4 })
        .withMessage('Senha deve ter pelo menos 4 caracteres'),
    
    handleValidation
];

// Validações para empréstimos
const validateLending = [
    body('bookId')
        .notEmpty()
        .withMessage('ID do livro é obrigatório')
        .isMongoId()
        .withMessage('ID do livro inválido'),
    
    body('studentId')
        .notEmpty()
        .withMessage('ID do estudante é obrigatório')
        .isMongoId()
        .withMessage('ID do estudante inválido'),
    
    body('lendingDate')
        .notEmpty()
        .withMessage('Data de empréstimo é obrigatória')
        .isISO8601()
        .withMessage('Data de empréstimo inválida'),
    
    body('returnDate')
        .notEmpty()
        .withMessage('Data de devolução é obrigatória')
        .isISO8601()
        .withMessage('Data de devolução inválida')
        .custom((value, { req }) => {
            const lendingDate = new Date(req.body.lendingDate);
            const returnDate = new Date(value);
            if (returnDate <= lendingDate) {
                throw new Error('Data de devolução deve ser posterior à data de empréstimo');
            }
            return true;
        }),
    
    handleValidation
];

module.exports = {
    validateBook,
    validateUser,
    validateLogin,
    validateLending,
    handleValidation
};
