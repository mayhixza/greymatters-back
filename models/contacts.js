const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ContactSchema = new Schema({
    post: {
        type: String,
        required: true
    },
    mail: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Contact", ContactSchema);
