const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EventSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        // required: true
    },
    content: {
        type: String,
        required: true
    },
    link: {
        type: String
    },
    image: String
}, { timestamps: true });

module.exports = mongoose.model("Events", EventSchema);