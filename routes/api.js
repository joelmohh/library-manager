const express = require('express')
const router = express.Router()
const verify = require('../modules/verify')

const Lending = require('../models/lending')
const Book = require('../models/book')
const Student = require('../models/user')
const Action = require('../models/actions')

router.post('/loans/return/:loanID', verify.rl, async (req, res) => {
    try {
        const loan = await Lending.findById(req.params.loanID);

        if (!loan) {
            return res.status(404).json({ status: "error", error: 'Empréstimo não encontrado', id: req.query.loanID, loan });
        }

        loan.status = 'devolvido';
        loan.returnDate = new Date();
        await loan.save();
        
        Book.updateOne({ _id: loan.bookID }, { $set: { status: '0' } }).exec();

        // Registra ação de devolução
        await Action.create({
            action: `Livro ${loan.bookName} devolvido`,
            action_target: 'lending',
            action_type: 'update',
            action_date: new Date(),
            user: req.session.name
        });
        
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao processar devolução:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
})
router.post('/loans/create', verify.rl, async (req, res) => {
    try {
        const {bookId, studentId, lendingDate, returnDate} = req.body;

        if (!bookId || !studentId || !lendingDate || !returnDate) {
            return res.status(400).json({ error: 'Parâmetros preenchidos incorretamente' });
        }
        
        const student = await Student.findById(studentId);
        const book = await Book.findById(bookId);

        const lendingObj = {
            bookID: bookId,
            studentID: studentId,
            studentName: student.name,
            bookName: book.title,
            returnDate: new Date(returnDate),
            lendingDate: new Date(lendingDate),
        }

        await Lending.create(lendingObj).then(async () => {
            Book.updateOne({ _id: bookId }, { $set: { status: '1' } }).exec();

            // Registra ação de empréstimo
            await Action.create({
                action: `Livro ${book.title} emprestado`,
                action_target: 'lending',
                action_type: 'create',
                action_date: new Date(),
                user: req.session.name
            });

            res.json({ success: true });
        }).catch((error) => {
            console.error('Erro ao criar empréstimo:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        })

    } catch (error) {
        console.error('Erro ao processar devolução', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
})


router.post('/students/create', verify.rl, async (req, res) => {
    try {
        const student = {
            name: req.body.name,
            email: null,
            class: req.body.class,
            role: req.body.role,
            password: null,
            ra: req.body.ra // Adicionando o RA aqui
        }
        await Student.create(student)

        // Registra ação de criação de usuário
        await Action.create({
            action: `Usuário criado: ${student.name}`,
            action_target: 'user',
            action_type: 'create',
            action_date: new Date(),
            user: req.session.name
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
})
router.post('/students/edit/:studentID', verify.rl, async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentID);

        const newStudentInfo = {
            name: req.body.name,
            email: req.body.username,
            class: req.body.class,
        }
        if (!student) {
            return res.status(404).json({ error: 'Estudante não encontrado' });
        }

        await student.updateOne(newStudentInfo);

        // Registra ação de edição de usuário
        await Action.create({
            action: `Usuário editado: ${newStudentInfo.name}`,
            action_target: 'user',
            action_type: 'update',
            action_date: new Date(),
            user: req.session.name
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao deletar estudante:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
})
router.post('/students/delete/:studentID', verify.rl, async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentID);

        if (!student) {
            return res.status(404).json({ error: 'Estudante não encontrado' });
        }

        await student.deleteOne({ _id: req.params.studentID });

        // Registra ação de exclusão de usuário
        await Action.create({
            action: `Usuário apagado: ${student.name}`,
            action_target: 'user',
            action_type: 'delete',
            action_date: new Date(),
            user: req.session.name
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao deletar estudante:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
})

/*
/
/   BOOK ROUTES
/
*/
router.post('/books/create', verify.rl, async (req, res) => {
    try {
        const book = {
            title: req.body.title,
            autor: req.body.autor,
            category: req.body.category,
            status: 0
        }

        await Book.create(book).then(async () => {
            // Registra ação de criação de livro
            await Action.create({
                action: `Livro criado: ${book.title}`,
                action_target: 'book',
                action_type: 'create',
                action_date: new Date(),
                user: req.session.name
            });

            res.json({ success: true });
        }).catch((error) => {
            console.error('Erro ao criar livro:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        })
    } catch (error) {
        console.error('Erro ao criar livro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
})

router.post('/books/edit/:bookID', verify.rl, async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookID);

        const newBookInfo = {
            title: req.body.title,
            autor: req.body.autor,
            category: req.body.category
        }
        if (!book) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }

        await book.updateOne(newBookInfo);

        // Registra ação de edição de livro
        await Action.create({
            action: `Livro editado: ${newBookInfo.title}`,
            action_target: 'book',
            action_type: 'update',
            action_date: new Date(),
            user: req.session.name
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao editar livro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
})

router.post('/books/delete/:bookID', verify.rl, async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookID);

        if (!book) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }

        await Book.deleteOne({ _id: req.params.bookID });

        // Registra ação de exclusão de livro
        await Action.create({
            action: `Livro apagado: ${book.title}`,
            action_target: 'book',
            action_type: 'delete',
            action_date: new Date(),
            user: req.session.name
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao deletar livro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
})

router.get('/books/page', verify.rl, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        // Primeiro busca apenas o total para paginação
        const total = await Book.countDocuments(
            search ? {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { autor: { $regex: search, $options: 'i' } },
                    { category: { $regex: search, $options: 'i' } }
                ]
            } : {}
        );

        // Depois busca apenas os dados da página atual
        const rows = await Book.find(
            search ? {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { autor: { $regex: search, $options: 'i' } },
                    { category: { $regex: search, $options: 'i' } }
                ]
            } : {}
        )
            .sort({ title: 1 })
            .skip(skip)
            .limit(limit)
            .lean();

        res.json({
            rows,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Erro ao buscar livros:', error);
        res.status(500).json({ error: 'Erro ao buscar livros' });
    }
});

/*
/
/  PROFILE ROUTES
/
*/
router.post('/profile/edit', verify.rl, async (req, res) => {
    try {
        const user = await Student.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Verifica se a senha atual está correta
        if (req.body.currentPassword && req.body.currentPassword !== user.password) {
            return res.status(400).json({ error: 'Senha atual incorreta' });
        }

        const newUserInfo = {
            name: req.body.name,
            username: req.body.email // Correção aqui também, usando username em vez de email
        };

        // Atualiza a senha apenas se uma nova senha foi fornecida
        if (req.body.newPassword) {
            newUserInfo.password = req.body.newPassword;
        }

        await Student.updateOne({ _id: req.session.userId }, newUserInfo);
        
        // Atualiza o nome na sessão
        req.session.name = req.body.name;
        
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao editar perfil:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});





//
//
//
//   FORGOT PASSWORD ROUTES
//
//

router.post('/forgot-password', async (req, res) => {
    try {

        const { email } = req.body;

        




    }
    catch (error) {
        console.error('Erro ao solicitar recuperação de senha:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
})


module.exports = router