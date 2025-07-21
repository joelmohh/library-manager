# 📚 Library Manager System

School library management system developed in Node.js with Express and MongoDB.

## 🚀 Features

- ✅ **Secure authentication** with password hashing
- 📖 **Book management** (complete CRUD)
- 👥 **User management** (students, teachers, admins)
- 📋 **Lending system** with date control
- 📊 **Administrative dashboard** with metrics
- 🔍 **Optimized search and pagination**
- 📝 **Action logging** for audit trail
- 🔒 **Enhanced security** with rate limiting and sanitization

## 🛠️ Technologies Used

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Template Engine:** EJS
- **Authentication:** bcrypt, express-session
- **Security:** Helmet, express-rate-limit, express-mongo-sanitize
- **Validation:** express-validator

## 📦 Installation

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

## 🔧 Available Scripts

- `npm start` - Production server
- `npm run dev` - Development with nodemon

---

**🎉 System is now robust, secure, and production-ready!**
