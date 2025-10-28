const express = require("express")
const session = require("cookie-session")
const bodyParser = require("body-parser")
const fs = require("fs")
const path = require("path")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
require("dotenv").config({ debug: false })
const mongoose = require("mongoose")
const { isLoggedIn, loginRedirect } = require("./modules/verify")

// Middleware de controle de permissões
function requireRole(role) {
  return function (req, res, next) {
    if (!req.session || !req.session.type) {
      return res.status(403).render("login", { page: { title: "Login" }, error: "Acesso negado." });
    }
    if (req.session.type !== role) {
      return res.status(403).render("index", { page: { title: "Home" }, error: "Permissão insuficiente." });
    }
    next();
  };
}

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
      connectSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://www.googleapis.com"]
    }
  }
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100000, // máximo 1000 requests por IP (aumentado de 100)
  message: { error: "Muitas tentativas. Tente novamente em 15 minutos." }
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas de login por IP
  message: { error: "Muitas tentativas de login. Tente novamente em 15 minutos." }
})

app.use(limiter)
app.use("/api/auth", authLimiter)

// Sanitização de entrada para prevenir NoSQL Injection
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      for (let key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key].replace(/[\$\{\}]/g, '');
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      }
    }
    return obj;
  };
  
  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  
  next();
})

app.use(bodyParser.json({ limit: "10mb" }))
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }))
app.set("view engine", "ejs")
app.set("views", "./views")
app.use(express.static("public"))
app.use(
  session({
    name: "library-session",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
      sameSite: "strict",
      secure: "production", // HTTPS em produção
      httpOnly: true,
    },
  }),
)

// Conexão com MongoDB
mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("DATABASE CONECTADA")
  })
  .catch((error) => {
    console.error("Erro ao conectar com o banco:", error)
    process.exit(1)
  })



// Carregamento automático de rotas
const routesPath = path.join(__dirname, "routes")

function loadRoutes(routesDir) {
  if (!fs.existsSync(routesDir)) {
    console.warn("⚠️ Pasta routes não encontrada")
    return
  }

  fs.readdirSync(routesDir).forEach((item) => {
    const itemPath = path.join(routesDir, item)
    const stat = fs.statSync(itemPath)

    if (stat.isDirectory()) {
      const routeName = item // Nome da pasta será o nome da rota
      const router = express.Router()

      // Lê todos os arquivos .js dentro da pasta
      fs.readdirSync(itemPath).forEach((file) => {
        if (path.extname(file) === ".js") {
          const filePath = path.join(itemPath, file)

          try {
            const routeModule = require(filePath)

            // Se o módulo exporta um router, merge com o router principal
            if (routeModule && typeof routeModule === "function") {
              router.use(routeModule)
            } else if (routeModule && routeModule.router) {
              router.use(routeModule.router)
            }

            // Mensagem minimizada
          } catch (error) {
            console.error(`❌ Erro ao carregar ${routeName}/${file}:`, error.message)
          }
        }
      })

      // Registra a rota principal
  app.use(`/api/${routeName}`, router)
    } else if (path.extname(item) === ".js") {
      // É um arquivo .js diretamente na pasta routes
      const routeName = path.basename(item, ".js")
      const routePath = path.join(routesDir, item)

      try {
        app.use(`/api/${routeName}`, require(routePath))
      } catch (error) {
        // Mensagem de erro mantida
      }
    }
  })
}

loadRoutes(routesPath)
console.log('ROTAS CARREGADAS')

app.get("/", (req, res) => {
  res.render("index", { page: { title: "Home" } })
})

app.get("/login", loginRedirect, (req, res) => {
  res.render("login", { page: { title: "Login" } })
})

//Student Routes
app.get("/student", (req, res) => {
  res.render("student_dashboard", { 
    user: req.session.username,
    page: { title: "Dashboard do Aluno" }
  })
})

//Admin Routes
app.get("/admin", isLoggedIn, requireRole("admin"), (req, res) => {
  res.render("admin_dashboard", { user: req.session.username, page: { title: "Dashboard Admin" } })
})

app.get("/admin/users", isLoggedIn, requireRole("admin"), (req, res) => {
  res.render("admin_users", { user: req.session.username, page: { title: "Gerenciar Usuários" } })
})

app.get("/admin/books", isLoggedIn, requireRole("admin"), (req, res) => {
  res.render("admin_books", { user: req.session.username, page: { title: "Gerenciar Livros" } })
})

app.get("/admin/lending", isLoggedIn, requireRole("admin"), (req, res) => {
  res.render("admin_lending", { user: req.session.username, page: { title: "Gerenciar Empréstimos" } })
})

app.get("/admin/audit", isLoggedIn, requireRole("admin"), (req, res) => {
  res.render("admin_audit", { user: req.session.username, page: { title: "Auditoria" } })
})

app.get("/admin/settings", isLoggedIn, requireRole("admin"), async (req, res) => {
  try {
    const User = require('./models/User');
    const user = await User.findById(req.session.userId);
    
    if (!user) {
      console.log('Usuário não encontrado na base de dados');
      return res.redirect('/login');
    }
    
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName || '',
      role: user.type || 'user'
    };
    
    res.render("admin_settings", { 
      user: userData,
      page: { title: "Configurações" } 
    });
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    // Fallback com dados da sessão
    const userData = {
      id: req.session.userId || 'unknown',
      username: req.session.username || 'Usuario',
      email: 'usuario@exemplo.com',
      fullName: req.session.username || 'Usuario',
      role: req.session.type || 'user'
    };
    
    res.render("admin_settings", { 
      user: userData,
      page: { title: "Configurações" } 
    });
  }
})

app.get("/student/settings", isLoggedIn, (req, res) => {
  res.render("student_settings", { user: req.session.username, page: { title: "Configurações" } })
})

// Middleware de tratamento de erros global
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  
  // Log do erro para debug
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }
  
  // Resposta de erro genérica
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Erro interno do servidor' 
    : err.message;
    
  res.status(statusCode).json({
    error: true,
    message: message
  });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: 'Rota não encontrada'
  });
});

app.listen(PORT, () => {
  console.log('SERVIDOR INICIADO')
})
