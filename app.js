const express = require('express');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.use(session({
    name: 'library-session',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
        sameSite: 'strict',
        secure: 'production', // HTTPS em produção
        httpOnly: true
    }
}));

// Conexão com MongoDB
mongoose.connect(process.env.DB_URL)
.then(() => {
    console.log('✅ DATABASE CONECTADA');
})
.catch((error) => {
    console.error('❌ Erro ao conectar com o banco:', error);
    process.exit(1);
});

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
///////////////// MAIN ROUTES ////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

app.get('/', (req, res) =>{
    res.render('index');
})

// Carregamento automático de rotas
const routesPath = path.join(__dirname, 'routes');

function loadRoutes(routesDir) {
    if (!fs.existsSync(routesDir)) {
        console.warn('⚠️ Pasta routes não encontrada');
        return;
    }

    fs.readdirSync(routesDir).forEach(item => {
        const itemPath = path.join(routesDir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
            // É uma pasta (books, lending, users, etc.)
            const routeName = item; // Nome da pasta será o nome da rota
            const router = express.Router();
            
            // Lê todos os arquivos .js dentro da pasta
            fs.readdirSync(itemPath).forEach(file => {
                if (path.extname(file) === '.js') {
                    const filePath = path.join(itemPath, file);
                    
                    try {
                        const routeModule = require(filePath);
                        
                        // Se o módulo exporta um router, merge com o router principal
                        if (routeModule && typeof routeModule === 'function') {
                            router.use(routeModule);
                        } else if (routeModule && routeModule.router) {
                            router.use(routeModule.router);
                        }
                        
                        console.log(`✅ Arquivo carregado: ${routeName}/${file}`);
                    } catch (error) {
                        console.error(`❌ Erro ao carregar ${routeName}/${file}:`, error.message);
                    }
                }
            });
            
            // Registra a rota principal
            app.use(`/api/${routeName}`, router);
            console.log(`🚀 Rota registrada: /api/${routeName}`);
            
        } else if (path.extname(item) === '.js') {
            // É um arquivo .js diretamente na pasta routes
            const routeName = path.basename(item, '.js');
            const routePath = path.join(routesDir, item);
            
            try {
                app.use(`/api/${routeName}`, require(routePath));
                console.log(`✅ Rota carregada: /api/${routeName}`);
            } catch (error) {
                console.error(`❌ Erro ao carregar rota ${routeName}:`, error.message);
            }
        }
    });
}

loadRoutes(routesPath);




app.listen(PORT, () => {
    console.log(`✅ Servidor rodando na porta ${PORT}`);
});