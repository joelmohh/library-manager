const express = require("express");
const bodyParser = require('body-parser');
const session = require('cookie-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

const app = express();

// Middleware de segurança
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// Rate limiting geral
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requisições por IP
    message: 'Muitas requisições deste IP, tente novamente mais tarde.'
});
app.use(limiter);

// Middleware de parsing e sanitização
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize()); // Previne injeção NoSQL

// Configuração de sessão melhorada
app.use(session({
    name: 'library-session',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production', // HTTPS em produção
        httpOnly: true
    }
}));

// Imports
const verify = require('./modules/verify');
const authRoutes = require('./routes/auth');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { processUserData, logAction } = require('./utils/helpers');

// Conexão com MongoDB melhorada
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    logAction('DATABASE_CONNECTED', { url: process.env.DB_URL });
    console.log('✅ DATABASE CONECTADA');
})
.catch((error) => {
    logAction('DATABASE_CONNECTION_ERROR', { error: error.message });
    console.error('❌ Erro ao conectar com o banco:', error);
    process.exit(1);
});

// Models
const Book = require('./models/book');
const User = require('./models/user');
const Lending = require('./models/lending');
const Action = require('./models/actions');

// Configuração do template engine
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));

// Rotas de autenticação
app.use('/auth', authRoutes);

// Rota principal com tratamento de erro
app.get('/', async (req, res, next) => {
    try {
        const books = await Book.find({ isActive: true })
                                .sort({ title: 1 })
                                .limit(50)
                                .lean();
        
        res.render('index', { books });
    } catch (error) {
        next(error);
    }
});

app.get('/login/:userrole', verify.rH, async (req, res, next) => {
    try {
        const validRoles = ['admin', 'student', 'teacher'];
        const userRole = req.params.userrole;
        
        if (!validRoles.includes(userRole)) {
            return res.status(400).render('error', { 
                message: 'Tipo de usuário inválido' 
            });
        }
        
        res.render('login', { user_role: userRole });
    } catch (error) {
        next(error);
    }
});

/*
 * DASHBOARD ROUTES
 */

app.get('/dash', verify.rl, async (req, res, next) => {
    try {
        // Consultas otimizadas em paralelo
        const [booksCount, studentsCount, activeLendingsCount, recentActions] = await Promise.all([
            Book.countDocuments({ isActive: true }),
            User.countDocuments({ role: "student", isActive: true }),
            Lending.countDocuments({ status: 'active' }),
            Action.find({})
                  .sort({ actionDate: -1 })
                  .limit(3)
                  .lean()
        ]);

        const user = processUserData(req.session.name);

        res.render(__dirname + '/views/dash/home.ejs', { 
            user,
            books: booksCount,
            students: studentsCount, 
            lending: activeLendingsCount,
            actions: recentActions,
            currentPath: '/dash'
        });
    } catch (error) {
        next(error);
    }
});
app.get('/dash/books', verify.rl, async (req, res, next) => {
    try {
        const limit = 5;
        const books = await Book.find({ isActive: true })
            .sort({ title: 1 })
            .limit(limit)
            .lean();
        
        const user = processUserData(req.session.name);
        
        res.render('dash/books.ejs', { 
            user,
            books, 
            currentPath: '/dash/books'
        });
    } catch (error) {
        next(error);
    }
});

app.get('/dash/users', verify.rl, async (req, res, next) => {
    try {
        const students = await User.find({ 
            role: "student", 
            isActive: true 
        })
        .sort({ name: 1 })
        .lean();
        
        const user = processUserData(req.session.name);
        
        res.render(__dirname + '/views/dash/users.ejs', { 
            user,
            students,
            currentPath: '/dash/users'
        });
    } catch (error) {
        next(error);
    }
});

app.get('/dash/loans', verify.rl, async (req, res, next) => {
    try {
        // Consultas otimizadas em paralelo
        const [loans, students, availableBooks] = await Promise.all([
            Lending.find({ status: { $in: ['active', 'overdue'] } })
                   .populate('book', 'title author category')
                   .populate('student', 'name class ra')
                   .sort({ lendingDate: -1 })
                   .lean(),
            User.find({ role: "student", isActive: true })
                .sort({ class: 1, name: 1 })
                .select('name class ra')
                .lean(),
            Book.find({ status: 0, isActive: true })
                .sort({ title: 1 })
                .select('title author category')
                .lean()
        ]);

        const user = processUserData(req.session.name);
        
        res.render('dash/loans', { 
            user,
            students,
            books: availableBooks,
            loans,
            currentPath: '/dash/loans'
        });
    } catch (error) {
        next(error);
    }
});

app.get('/dash/actions', verify.rl, async (req, res, next) => {
    try {
        const actions = await Action.find({})
                                   .sort({ actionDate: -1 })
                                   .limit(100)
                                   .lean();
        
        const user = processUserData(req.session.name);
        
        res.render('dash/actions', { 
            user,
            activities: actions,
            currentPath: '/dash/actions'
        });
    } catch (error) {
        next(error);
    }
});

app.get('/dash/profile', verify.rl, async (req, res, next) => {
    try {
        const userData = await User.findById(req.session.userId)
                                  .select('-password')
                                  .lean();

        if (!userData) {
            return res.status(404).render('error', { 
                message: 'Usuário não encontrado' 
            });
        }

        const user = processUserData(req.session.name);
        user.email = userData.username;
        user.class = userData.class;
        user.role = userData.role.toUpperCase();
        user.passwordLength = 8; // Valor fixo por segurança

        res.render('dash/profile', {
            user,
            password: '*'.repeat(user.passwordLength),
            currentPath: '/dash/profile'
        });
    } catch (error) {
        next(error);
    }
});

/*
 * API ROUTES
 */
app.use('/api', require('./routes/api'));


// Rota de API paginada para livros (dashboard)
app.get('/api/books/page', verify.rl, async (req, res, next) => {
    try {
        const { getPaginationParams, createSearchQuery } = require('./utils/helpers');
        const { page, limit, skip } = getPaginationParams(req.query.page, req.query.limit, 50);
        const search = req.query.search ? req.query.search.trim() : '';

        const query = createSearchQuery(search, ['title', 'author', 'category']);
        query.isActive = true;

        const [rows, total] = await Promise.all([
            Book.find(query)
                .sort({ title: 1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Book.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: {
                rows,
                total,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPreviousPage: page > 1
            }
        });
    } catch (error) {
        next(error);
    }
});

// Rota de API pública para livros (sem autenticação)
app.get('/api/public/books/page', async (req, res, next) => {
    try {
        const { getPaginationParams, createSearchQuery } = require('./utils/helpers');
        const { page, limit, skip } = getPaginationParams(req.query.page, req.query.limit, 20);
        const search = req.query.search ? req.query.search.trim() : '';

        const query = createSearchQuery(search, ['title', 'author']);
        query.isActive = true;

        const [rows, total] = await Promise.all([
            Book.find(query)
                .select('title author category status')
                .sort({ title: 1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Book.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: {
                rows,
                total,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPreviousPage: page > 1
            }
        });
    } catch (error) {
        next(error);
    }
});

// Rota de API paginada para ações
app.get('/api/actions/page', verify.rl, async (req, res, next) => {
    try {
        const { getPaginationParams, createSearchQuery } = require('./utils/helpers');
        const { page, limit, skip } = getPaginationParams(req.query.page, req.query.limit, 100);
        const search = req.query.search ? req.query.search.trim() : '';

        const query = createSearchQuery(search, ['action', 'actionTarget', 'user']);

        const [rows, total] = await Promise.all([
            Action.find(query)
                .sort({ actionDate: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Action.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: {
                rows,
                total,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPreviousPage: page > 1
            }
        });
    } catch (error) {
        next(error);
    }
});

// Middleware para rotas não encontradas
app.use(notFound);

// Middleware global de tratamento de erros
app.use(errorHandler);

// Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {    
    logAction('SERVER_STARTED', { port: PORT, env: process.env.NODE_ENV });
    console.log(`🚀 SERVIDOR INICIADO na porta ${PORT}`);
    console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

