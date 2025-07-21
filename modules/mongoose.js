const mongoose = require('mongoose')
require('dotenv').config()

async function findOne(collection, query){
    const Model = mongoose.model(collection)
    return await Model.findOne(query).exec()
}
async function insertOne(collection, data){
    const Model = mongoose.model(collection)
    return await Model.create(data)
}
async function updateOne(collection, query, data){
    const Model = mongoose.model(collection)
    return await Model.findOneAndUpdate(query, data).exec()
}
async function deleteOne(collection, query){
    const Model = mongoose.model(collection)
    return await Model.findOneAndDelete(query).exec()
}
async function findAll(collection){
    const Model = mongoose.model(collection)
    return await Model.find({}).exec()
}

module.exports = { findOne, insertOne, updateOne, deleteOne, findAll }