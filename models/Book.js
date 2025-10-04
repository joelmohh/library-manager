const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    editor: {
        type: String,
        required: true
    },
    isbn: {
        type: String,
        required: true
    },
    available: {
        type: Boolean,
        default: true
    }
})

const Book = mongoose.models.Book || mongoose.model('Book', bookSchema);
module.exports = Book;