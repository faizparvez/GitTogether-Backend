const mongoose = require("mongoose")

const connectDB = async() => {
    await mongoose.connect("mongodb+srv://faizparveez:xFXvYGLp93liXaV7@cluster0.ehqtlhi.mongodb.net/FullStack1"); 
};

module.exports = {connectDB};