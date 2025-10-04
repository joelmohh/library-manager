# Library Manager System

Sistema de gerenciamento de biblioteca escolar desenvolvido em Node.js com Express e MongoDB.

## ✨ Funcionalidades

- **Autenticação segura** com hash de senhas
- **Gerenciamento de livros** (CRUD completo)
- **Gerenciamento de usuários** (estudantes, professores, administradores)
- **Sistema de empréstimos** com controle de datas
- **Dashboard** com métricas
- **Busca otimizada e paginação**
- **Log de ações** para auditoria

## 🛠️ Tecnologias Utilizadas

- **Backend:** Node.js, Express.js
- **Banco de Dados:** MongoDB com Mongoose
- **Template Engine:** EJS
- **Autenticação:** bcrypt, cookie-session
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
# Para configurar seus usuários iniciais (admin e aluno execute) e livros de exemplo
node setup-users.js
```

Exemplo de configuração `.env`:
```env
DB_URL=mongodb://localhost:27017/library-manager
SESSION_SECRET=suasenha
PORT=porta
NODE_ENV=development
```

### 4. Executar o projeto
```bash
npm install

npm start
```


## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo `LICENSE` para mais detalhes.

## 👤 Autor

- **Joelmo** - [@joelmohh](https://github.com/joelmohh)

