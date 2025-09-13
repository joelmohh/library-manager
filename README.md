### Ações / Logs (`/api/actions`)

- `GET /` — Lista as últimas 100 ações do sistema (admin)
# Library Manager System

School library management system developed in Node.js with Express and MongoDB.

## Features

- **Secure authentication** with password hashing
- **Book management** (complete CRUD)
- **User management** (students, teachers, admins)
- **Lending system** with date control
- **Administrative dashboard** with metrics
- **Optimized search and pagination**
- **Action logging** for audit trail
- **Enhanced security** with rate limiting and sanitization

## Technologies Used

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Template Engine:** EJS
- **Authentication:** bcrypt, express-session
- **Security:** Helmet, express-rate-limit, express-mongo-sanitize
- **Validation:** express-validator

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the project root:
   ```env
   DB_URL=mongodb://localhost:27017/library-manager
   SESSION_SECRET=your_very_secure_secret_here
   PORT=3000
   NODE_ENV=development
   ```

3. **Run the project:**
   ```bash
   npm run dev  # development
   npm start    # production
   ```


## Rotas da API

Todas as rotas estão sob o prefixo `/api/`.

### Autenticação (`/api/auth`)

- `POST /login` — Realiza login do usuário
- `POST /register` — Cria novo usuário (admin)
- `POST /exit` — Logout
- `POST /reset-password` — Troca de senha

### Livros (`/api/books`)

- `GET /` — Lista todos os livros
- `GET /search?title=...` — Busca livros por título
- `GET /:page/:limit` — Paginação de livros

#### Gerenciamento de Livros (`/api/books`)
- `POST /add` — Adiciona livro (admin)
- `POST /remove/:id` — Remove livro (admin)
- `POST /update/:id` — Atualiza livro (admin)

### Empréstimos (`/api/lending`)

- `POST /add` — Cria empréstimo (admin)
- `POST /remove/:id` — Devolve empréstimo (admin)
- `POST /extend/:id` — Estende empréstimo (admin)

#### Consulta de Empréstimos (`/api/lending`)
- `GET /:page/:limit` — Lista empréstimos paginados (admin)
- `GET /search?query=...` — Busca empréstimos (admin)
- `GET /user/:userId` — Lista todos os livros emprestados de um usuário específico (admin)
- `GET /my-history` — Retorna o histórico de empréstimos do usuário logado (aluno/professor)

### Usuários (`/api/users`)

- `GET /:page/:limit` — Lista usuários paginados (admin)
- `GET /search?query=...` — Busca usuários (admin)
- `GET /:id` — Busca usuário por ID (admin)

#### Gerenciamento de Usuários (`/api/users`)
- `POST /add` — Adiciona usuário (admin)
- `POST /remove/:id` — Remove usuário (admin)
- `POST /update/:id` — Atualiza usuário (admin)

### Status (`/api/status`)

- `GET /ping` — Verifica status da API

## Scripts Disponíveis

- `npm start` — Servidor em produção
- `npm run dev` — Desenvolvimento com nodemon

## API Routes Documentation

### Books Routes (`/api/books`)

#### POST Routes
- `POST /api/books/add` - Adicionar novo livro
  - **Body:** `{ title, author, editor, isbn }`
  - **Response:** `201` - Livro criado com sucesso

- `POST /api/books/remove/:id` - Remover livro
  - **Params:** `id` (ID do livro)
  - **Response:** `200` - Livro removido com sucesso

- `POST /api/books/update/:id` - Atualizar livro
  - **Params:** `id` (ID do livro)
  - **Body:** `{ title, author, editor, isbn }`
  - **Response:** `200` - Livro atualizado com sucesso

#### GET Routes
- `GET /api/books/` - Listar todos os livros
  - **Response:** `200` - Array de livros

- `GET /api/books/search?title=<query>` - Buscar livros por título
  - **Query:** `title` (termo de busca)
  - **Response:** `200` - Array de livros encontrados

- `GET /api/books/:page/:limit` - Listar livros com paginação
  - **Params:** `page` (número da página), `limit` (limite por página)
  - **Response:** `200` - Array de livros paginados

### Users Routes (`/api/users`)

#### POST Routes
- `POST /api/users/add` - Adicionar novo usuário
  - **Body:** `{ username, fullName, email, password, type }`
  - **Response:** `201` - Usuário criado com sucesso

- `POST /api/users/remove/:id` - Remover usuário
  - **Params:** `id` (ID do usuário)
  - **Response:** `200` - Usuário removido com sucesso

- `POST /api/users/update/:id` - Atualizar usuário
  - **Params:** `id` (ID do usuário)
  - **Body:** `{ username, fullName, email, password, type }`
  - **Response:** `200` - Usuário atualizado com sucesso

#### GET Routes
- `GET /api/users/:page/:limit` - Listar usuários com paginação
  - **Params:** `page` (número da página), `limit` (limite por página)
  - **Response:** `200` - Objeto com usuários, total, página atual e última página

- `GET /api/users/search?query=<term>` - Buscar usuários por nome ou email
  - **Query:** `query` (termo de busca)
  - **Response:** `200` - Array de usuários encontrados

- `GET /api/users/:id` - Buscar usuário por ID
  - **Params:** `id` (ID do usuário)
  - **Response:** `200` - Dados do usuário | `404` - Usuário não encontrado

### Lending Routes (`/api/lending`)

#### POST Routes
- `POST /api/lending/add` - Criar novo empréstimo
  - **Body:** `{ book, user, startDate, endDate }`
  - **Response:** `201` - Empréstimo criado com sucesso

- `POST /api/lending/remove/:id` - Marcar empréstimo como devolvido
  - **Params:** `id` (ID do empréstimo)
  - **Response:** `200` - Empréstimo devolvido com sucesso

- `POST /api/lending/extend/:id` - Estender prazo do empréstimo
  - **Params:** `id` (ID do empréstimo)
  - **Body:** `{ newEndDate }`
  - **Response:** `200` - Empréstimo estendido com sucesso

#### GET Routes
- `GET /api/lending/:page/:limit` - Listar empréstimos com paginação
  - **Params:** `page` (número da página), `limit` (limite por página)
  - **Response:** `200` - Array de empréstimos com dados populados de livros e usuários

- `GET /api/lending/search?query=<term>` - Buscar empréstimos
  - **Query:** `query` (termo de busca para livro ou usuário)
  - **Response:** `200` - Array de empréstimos encontrados

### Main Routes

- `GET /` - Página inicial do sistema
  - **Response:** Renderiza a view `index.ejs`

## Response Formats

### Success Responses
```json
{
  "message": "Operation completed successfully",
  "data": { /* response data */ }
}
```

### Error Responses
```json
{
  "message": "Error description"
}
```

### HTTP Status Codes
- `200` - OK (operação bem-sucedida)
- `201` - Created (recurso criado com sucesso)
- `404` - Not Found (recurso não encontrado)
- `500` - Internal Server Error (erro interno do servidor)

---

**System is now robust, secure, and production-ready!**
