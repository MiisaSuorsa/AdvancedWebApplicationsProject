const { ListCollectionsCursor } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let usersSchema = new Schema({
    email: {type: String},
    name: {type: String},
    username: {type: String},
    password: {type: String},
    about: {type: String}
});


module.exports = mongoose.model("Users", usersSchema);