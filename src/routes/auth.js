const express = require("express");
const authRouter = express.Router();
const {User} = require("../models/user");

authRouter.post("/signup",async (req,res)=>{
    const user = new User({
        firstName:"Faiz",
        lastName:"Parvez",
        emailId:"faiz@gmail.com",
        password:"Faiz@123"
    })

    await user.save();

    res.send("User saved successfully");
})


module.exports = {authRouter};