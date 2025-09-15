# Library Manager System

Sistema de gerenciamento de biblioteca escolar desenvolvido em Node.js com Express e MongoDB.

## ✨ Funcionalidades

- **Autenticação segura** com hash de senhas
- **Gerenciamento de livros** (CRUD completo)
- **Gerenciamento de usuários** (estudantes, professores, administradores)
- **Sistema de empréstimos** com controle de datas
- **Dashboard administrativo** com métricas
- **Busca otimizada e paginação**
- **Log de ações** para auditoria
- **Segurança aprimorada** com rate limiting e sanitização

## 🛠️ Tecnologias Utilizadas

- **Backend:** Node.js, Express.js
- **Banco de Dados:** MongoDB com Mongoose
- **Template Engine:** EJS
- **Autenticação:** bcrypt, cookie-session
- **Segurança:** Helmet, express-rate-limit, express-mongo-sanitize
- **Validação:** express-validator

## 🚀 Instalação e Configuração

### 1. Pré-requisitos
- Node.js (versão 14 ou superior)
- MongoDB (local ou Atlas)
- Git

### 2. Instalação
```bash
# Clone o repositório
git clone https://github.com/joelmohh/library-manager.git

# Entre no diretório
cd library-manager

# Instale as dependências
npm install
```

### 3. Configuração do ambiente
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas configurações
```

Exemplo de configuração `.env`:
```env
DB_URL=mongodb://localhost:27017/library-manager
SESSION_SECRET=your_very_secure_secret_here_change_this_in_production
PORT=3000
NODE_ENV=development
```

### 4. Executar o projeto
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📖 Estrutura do Projeto

```
library-manager/
├── models/              # Modelos do MongoDB
│   ├── Actions.js       # Log de ações
│   ├── Book.js          # Modelo de livros
│   ├── Lending.js       # Modelo de empréstimos
│   └── User.js          # Modelo de usuários
├── routes/              # Rotas da API
│   ├── books/           # Rotas de livros
│   ├── lending/         # Rotas de empréstimos
│   ├── users/           # Rotas de usuários
│   ├── actions.js       # Rotas de auditoria
│   ├── auth.js          # Rotas de autenticação
│   └── status.js        # Status da API
├── views/               # Templates EJS
├── public/              # Arquivos estáticos
├── modules/             # Módulos utilitários
└── app.js               # Arquivo principal
```

## 🔐 Segurança Implementada

- **Rate Limiting:** Proteção contra ataques de força bruta
- **Helmet:** Headers de segurança HTTP
- **Sanitização:** Proteção contra injeção NoSQL
- **Validação:** Validação rigorosa de entrada
- **Hash de senhas:** bcrypt com salt rounds
- **Sessões seguras:** Configuração adequada de cookies

## 📚 API Documentation

### Base URL
Todas as rotas da API estão sob o prefixo `/api/`

### 🔑 Autenticação (`/api/auth`)

| Método | Endpoint | Descrição | Corpo da Requisição |
|--------|----------|-----------|---------------------|
| POST   | `/login` | Login do usuário | `{ username, password }` |
| POST   | `/register` | Criar usuário (admin) | `{ username, fullName, email, password, type }` |
| POST   | `/exit` | Logout | - |
| POST   | `/reset-password` | Trocar senha | `{ currentPassword, newPassword }` |

### 📖 Livros (`/api/books`)

| Método | Endpoint | Descrição | Parâmetros |
|--------|----------|-----------|------------|
| GET    | `/` | Listar todos os livros | - |
| GET    | `/search` | Buscar livros | `?title=termo` |
| GET    | `/:page/:limit` | Paginação | page, limit |
| POST   | `/add` | Adicionar livro (admin) | `{ title, author, editor, isbn }` |
| POST   | `/remove/:id` | Remover livro (admin) | id |
| POST   | `/update/:id` | Atualizar livro (admin) | `{ title, author, editor, isbn }` |

### 👥 Usuários (`/api/users`)

| Método | Endpoint | Descrição | Parâmetros |
|--------|----------|-----------|------------|
| GET    | `/:page/:limit` | Listar usuários (admin) | page, limit |
| GET    | `/search` | Buscar usuários (admin) | `?query=termo` |
| GET    | `/:id` | Buscar por ID (admin) | id |
| POST   | `/add` | Adicionar usuário (admin) | `{ username, fullName, email, password, type }` |
| POST   | `/remove/:id` | Remover usuário (admin) | id |
| POST   | `/update/:id` | Atualizar usuário (admin) | `{ dados }` |

### 📋 Empréstimos (`/api/lending`)

| Método | Endpoint | Descrição | Parâmetros |
|--------|----------|-----------|------------|
| GET    | `/:page/:limit` | Listar empréstimos (admin) | page, limit |
| GET    | `/search` | Buscar empréstimos (admin) | `?query=termo` |
| GET    | `/user/:userId` | Empréstimos por usuário (admin) | userId |
| GET    | `/my-history` | Histórico do usuário logado | - |
| POST   | `/add` | Criar empréstimo (admin) | `{ book, user, startDate, endDate }` |
| POST   | `/remove/:id` | Devolver livro (admin) | id |
| POST   | `/extend/:id` | Estender prazo (admin) | `{ newEndDate }` |

### 📊 Outras Rotas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET    | `/api/status/ping` | Status da API |
| GET    | `/api/actions` | Log de ações (admin) |

## 🎨 Páginas Web

| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/` | Página inicial | Público |
| `/login` | Página de login | Público |
| `/admin` | Dashboard admin | Admin |
| `/admin/users` | Gerenciar usuários | Admin |
| `/admin/books` | Gerenciar livros | Admin |
| `/admin/lending` | Gerenciar empréstimos | Admin |
| `/admin/audit` | Auditoria | Admin |
| `/student` | Dashboard estudante | Estudante/Professor |

## 📝 Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autenticado
- `403` - Acesso negado
- `404` - Não encontrado
- `409` - Conflito (já existe)
- `500` - Erro interno do servidor

## 🧪 Scripts Disponíveis

```bash
npm start      # Servidor em produção
npm run dev    # Desenvolvimento com nodemon
npm test       # Executar testes (a implementar)
```

## 🔧 Configurações de Produção

Para deploy em produção:

1. Configure `NODE_ENV=production`
2. Use uma string de sessão segura
3. Configure MongoDB Atlas ou instância dedicada
4. Configure HTTPS
5. Configure variáveis de ambiente no seu provedor

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo `LICENSE` para mais detalhes.

## 👤 Autor

- **Joel** - [@joelmohh](https://github.com/joelmohh)

## 🙏 Agradecimentos

- Express.js team
- MongoDB team
- Comunidade Node.js

---

**Sistema robusto, seguro e pronto para produção!** 🚀
