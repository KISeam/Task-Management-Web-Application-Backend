const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler")
require("dotenv").config();

const dbConnect = asyncHandler(async () => {
    try{
       const conn =  await mongoose.connect(process.env.MONGO_URI);
        console.log('Database connected successfully');
    } catch (error) {
        console.log('data error')
    }
});

module.exports = dbConnect;