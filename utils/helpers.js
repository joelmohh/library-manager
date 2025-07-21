const bcrypt = require('bcrypt');

// Utilitário para processar dados do usuário para o frontend
const processUserData = (sessionName) => {
    if (!sessionName) {
        throw new Error('Nome da sessão não fornecido');
    }
    
    const fullName = sessionName.split(' ');
    return {
        name: `${fullName[0]} ${fullName[fullName.length - 1]}`,
        firstLetters: `${fullName[0][0]}${fullName[fullName.length - 1][0]}`
    };
};

// Utilitário para hash de senha
const hashPassword = async (password) => {
    if (!password) {
        throw new Error('Senha não fornecida');
    }
    
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
};

// Utilitário para comparar senhas
const comparePassword = async (plainPassword, hashedPassword) => {
    if (!plainPassword || !hashedPassword) {
        return false;
    }
    
    return await bcrypt.compare(plainPassword, hashedPassword);
};

// Utilitário para validar ObjectId
const isValidObjectId = (id) => {
    return id && id.match(/^[0-9a-fA-F]{24}$/);
};

// Utilitário para criar query de busca
const createSearchQuery = (searchTerm, fields) => {
    if (!searchTerm) {
        return {};
    }
    
    return {
        $or: fields.map(field => ({
            [field]: { $regex: searchTerm, $options: 'i' }
        }))
    };
};

// Utilitário para paginação
const getPaginationParams = (page, limit, maxLimit = 50) => {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(maxLimit, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;
    
    return { page: pageNum, limit: limitNum, skip };
};

// Utilitário para logging estruturado
const logAction = (action, details = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${action}`, details);
};

module.exports = {
    processUserData,
    hashPassword,
    comparePassword,
    isValidObjectId,
    createSearchQuery,
    getPaginationParams,
    logAction
};
