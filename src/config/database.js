const mongoose = require("mongoose");

const connectDB = async () => {

    await mongoose.connect("mongodb+srv://sakthiviji019_db_user:5eHN8Q11OY6SRBqE@namastenode.nmcg0eq.mongodb.net/devTinder");
}

module.exports = connectDB;