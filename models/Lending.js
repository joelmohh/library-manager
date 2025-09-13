const mongoose = require('mongoose');

const LendingSchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'returned'],
        default: 'active'
    }
});

const Lending = mongoose.models.Lending || mongoose.model('Lending', LendingSchema);
module.exports = Lending;