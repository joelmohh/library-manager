
const express = require('express');
const router = express.Router();

const Book = require('../../models/Book');

router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let books;
        
        if (search) {
            // Se há parâmetro de busca, fazer busca por título, autor ou ISBN
            books = await Book.find({
                $or: [
                    { title: new RegExp(search, 'i') },
                    { author: new RegExp(search, 'i') },
                    { isbn: new RegExp(search, 'i') }
                ]
            });
        } else {
            // Caso contrário, retornar todos os livros
            books = await Book.find();
        }
        
        res.status(200).json({ success: true, books: books });
    } catch (error) {
        console.error('Erro ao buscar livros:', error.message);
        res.status(500).json({ success: false, message: 'Não foi possível buscar os livros.' });
    }
});
// Contagem total de livros
router.get('/count', async (req, res) => {
    try {
        const total = await Book.countDocuments();
        const available = await Book.countDocuments({ available: true });
        res.status(200).json({ total, available });
    } catch (error) {
        console.error('Erro ao contar livros:', error.message);
        res.status(500).json({ message: 'Não foi possível contar os livros.' });
    }
});
router.get('/search', async (req, res) => {
    const { title: query } = req.query;
    try {
        const books = await Book.find({ title: new RegExp(query, 'i') });
        res.status(200).json({
            books: books,
            total: books.length,
            page: 1,
            lastPage: 1
        });
    } catch (error) {
        console.error('Erro ao buscar livros por título:', error.message);
        res.status(500).json({ message: 'Não foi possível buscar livros por título.' });
    }
});

// Buscar livro específico por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    
    // Se não for um ObjectId válido, pular para próxima rota
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return next();
    }
    
    try {
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ message: 'Livro não encontrado' });
        }
        res.status(200).json(book);
    } catch (error) {
        console.error('Erro ao buscar livro por ID:', error.message);
        res.status(500).json({ message: 'Não foi possível buscar o livro.' });
    }
});

router.get('/:page/:limit', async (req, res) => {
    const { page, limit } = req.params;
    const { availability } = req.query;
    
    try {
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        
        // Build filter object
        let filter = {};
        if (availability !== undefined && availability !== '') {
            filter.available = availability === 'true';
        }
        
        // Count total documents with filter
        const total = await Book.countDocuments(filter);
        
        // Get books for current page with filter
        const books = await Book.find(filter)
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);
            
        // Calculate pagination info
        const lastPage = Math.ceil(total / limitNum);
        
        res.status(200).json({
            books: books,
            total: total,
            page: pageNum,
            lastPage: lastPage,
            hasNext: pageNum < lastPage,
            hasPrev: pageNum > 1
        });
    } catch (error) {
        console.error('Erro ao buscar livros por página:', error.message);
        res.status(500).json({ message: 'Não foi possível buscar livros por página.' });
    }
});


module.exports = router;