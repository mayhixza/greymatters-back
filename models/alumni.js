const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AlumniSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    post: {
        type: String,
        required: true
    },
    current: String,
    year: Number,
    socials: Array,
    image: String
});

module.exports = mongoose.model("Alumni", AlumniSchema);