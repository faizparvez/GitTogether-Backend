const express = require("express");
const authRouter = express.Router();
const { User } = require("../models/user");
const bcrypt = require("bcrypt");
const { validateSignupData } = require("../utils/validation");
const jwt = require("jsonwebtoken");

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
    const token = jwt.sign({ _id: savedUser._id }, "28@ugust22", {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000), // cookie will be removed after 8 hours
    });

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
      const token = await jwt.sign({ _id: user._id }, "28@ugust22", {
        expiresIn: "1h",
      });
      //   console.log(token);

      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000), // cookie will be removed after 8 hours
      });

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
      expires: new Date(Date.now()),
    });
    res.send("Logout Successfull");
  } catch (err) {
    res.status(404).send("ERROR: " + err.message);
  }
});

module.exports = { authRouter };
