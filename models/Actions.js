const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['added', 'removed', 'updated', 'deleted']
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const Actions = mongoose.models.Actions || mongoose.model('Actions', actionSchema);
module.exports = Actions;