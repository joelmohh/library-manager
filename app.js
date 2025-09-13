const express = require("express")
const session = require("cookie-session")
const bodyParser = require("body-parser")
const fs = require("fs")
const path = require("path")
require("dotenv").config({ debug: false })
const mongoose = require("mongoose")
const { isLoggedIn } = require("./modules/verify")

const app = express()
const PORT = process.env.PORT || 3000

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

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
///////////////// MAIN ROUTES ////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

app.get("/", (req, res) => {
  res.render("index")
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
      // É uma pasta (books, lending, users, etc.)
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
  //pega os 10 primeiros livros da tabela

  res.render("index", { page: { title: "Home" } })
})

app.get("/login", isLoggedIn, (req, res) => {
  res.render("login", { page: { title: "Login" } })
})

//Student Routes
app.get("/student", (req, res) => {
  res.render("student_dashboard", { user: req.session.username })
})

//Admin Routes
app.get("/admin", (req, res) => {
  res.render("admin_dashboard", { user: req.session.username, page: { title: "Dashboard Admin" } })
})

app.get("/admin/users", (req, res) => {
  res.render("admin_users", { user: req.session.username, page: { title: "Gerenciar Usuários" } })
})

app.get("/admin/books", (req, res) => {
  res.render("admin_books", { user: req.session.username, page: { title: "Gerenciar Livros" } })
})

app.get("/admin/lending", (req, res) => {
  res.render("admin_lending", { user: req.session.username, page: { title: "Gerenciar Empréstimos" } })
})

app.get("/admin/audit", (req, res) => {
  res.render("admin_audit", { user: req.session.username, page: { title: "Auditoria" } })
})

app.listen(PORT, () => {
  console.log('SERVIDOR INICIADO')
})
