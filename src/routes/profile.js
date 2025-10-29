const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateEditprofileData } = require("../utils/validation");

// check login => attach profile of user while loginAuth => send back the profile
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});


// email, password, isPremium, membershipType can't be edited
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    // Validate edit request
    validateEditprofileData(req);

    const loggedinuser = req.user;

    // Update only the fields present in request body
    Object.keys(req.body).forEach((key) => {
      loggedinuser[key] = req.body[key];
    });

    // Save updated user (mongoose validation will run automatically)
    await loggedinuser.save();

    // Remove password from response
    const userResponse = loggedinuser.toObject();
    delete userResponse.password;

    res.json({
      message: `${loggedinuser.firstName}, your profile is updated successfully!`,
      data: userResponse
    });

  } catch (err) {
    // Handle validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        error: err.message 
      });
    }

    // Handle custom validation errors
    res.status(400).json({ 
      error: err.message 
    });
  }
});


module.exports = { profileRouter };