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
# Para configurar seus usários iniciais (admin e aluno execute)
node setup-users.js
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

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo `LICENSE` para mais detalhes.

## 👤 Autor

- **Joelmo** - [@joelmohh](https://github.com/joelmohh)

