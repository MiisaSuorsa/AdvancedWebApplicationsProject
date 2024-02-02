const { ListCollectionsCursor } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let chatsSchema = new Schema({
    users: {type: Array},
    messages: {type: Array}
});


module.exports = mongoose.model("Chats", chatsSchema);
