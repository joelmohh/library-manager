// Middleware global para tratamento de erros
const errorHandler = (err, req, res, next) => {
    console.error('Erro capturado:', err.stack);

    // Erro de validação do Mongoose
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            error: 'Erro de validação',
            details: errors
        });
    }

    // Erro de cast do MongoDB (ID inválido)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error: 'ID inválido fornecido'
        });
    }

    // Erro de duplicata (chave única)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            success: false,
            error: `${field} já existe no sistema`
        });
    }

    // Erro padrão
    res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' 
            ? 'Erro interno do servidor' 
            : err.message
    });
};

// Middleware para rotas não encontradas
const notFound = (req, res, next) => {
    const error = new Error(`Rota não encontrada - ${req.originalUrl}`);
    error.status = 404;
    next(error);
};

module.exports = { errorHandler, notFound };
