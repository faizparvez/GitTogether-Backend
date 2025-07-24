const express = require("express");
const {connectDB} = require("./config/database");
const app = express();


const {authRouter} = require("./routes/auth");
const {profileRouter} = require("./routes/profile");
const {requestRouter} = require("./routes/request");
const {userRouter} = require("./routes/user");

app.use("/",authRouter);


connectDB()
 .then(()=>{
    console.log("Database connected successfully");
    app.listen(3000,()=>{
        console.log("Server is listening on port 3000...");
    })
 })
 .catch((err)=>{
    console.error("Database connection can't be established");
 })