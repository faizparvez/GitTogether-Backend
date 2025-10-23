const express = require("express");
const authRouter = express.Router();
const { User } = require("../models/user");
const bcrypt = require("bcrypt");
const { validateSignupData } = require("../utils/validation");
const jwt = require("jsonwebtoken");

// Cookie configuration for production
const getCookieOptions = () => ({
  httpOnly: true,
  secure: true, // HTTPS only (Render provides HTTPS)
  sameSite: "none", // Allow cross-domain (Vercel → Render)
  maxAge: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
});

// validateData => encrypt password => create an instance => store in DB
authRouter.post("/signup", async (req, res) => {
  try {
    validateSignupData(req);

    console.log(req.body);
    const { firstName, lastName, email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
    });

    const savedUser = await user.save();
    const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    res.cookie("token", token, getCookieOptions());

    res.json({ message: "User added successfully", data: savedUser });
  } catch (err) {
    res.status(404).send("ERROR: " + err.message);
  }
});

// check email => check password => create token => send with a cookie
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("Invalid Credentials");
    }

    const ispassValid = await bcrypt.compare(password, user.password);
    if (ispassValid) {
      const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "8h",
      });
      //   console.log(token);

      res.cookie("token", token, getCookieOptions());

      // res.send("Login Successfull");
      res.send(user);
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (err) {
    res.status(404).send("ERROR: " + err.message);
  }
});

// create cookie which expires now => send the response
authRouter.post("/logout", async (req, res) => {
  try {
    res.cookie("token", null, {
      ...getCookieOptions(),
      maxAge: 0, // Expire immediately
    });
    res.send("Logout Successfull");
  } catch (err) {
    res.status(404).send("ERROR: " + err.message);
  }
});

module.exports = { authRouter };
