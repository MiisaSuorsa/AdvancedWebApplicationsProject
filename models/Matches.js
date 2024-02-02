const { ListCollectionsCursor } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let matchSchema = new Schema({
    user: {type: String},
    like: {type: Array},
    match: {type: Array}
});


module.exports = mongoose.model("Matches", matchSchema);
