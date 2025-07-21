const mongoose = require('mongoose')

const codeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    userEmail:{
        type: String,
        required: true
    },
    
})

module.exports = mongoose.model('code', codeSchema)