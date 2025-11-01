const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateEditprofileData } = require("../utils/validation");
const { User } = require("../models/user");

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

/** 
 * Fetch user profile by ID
 * Protected fields (password, email) are hidden from other users
 */
profileRouter.get("/profile/:id", userAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const loggedInUserId = req.user._id.toString();

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        error: "Invalid user ID format" 
      });
    }

    // Fetch user profile
    const user = await User.findById(id).select('-password');

    // Check if user exists
    if (!user) {
      return res.status(404).json({ 
        error: "User not found" 
      });
    }

    // Prepare response data
    const profileData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      photoURL: user.photoURL,
      about: user.about,
      age: user.age,
      gender: user.gender,
      skills: user.skills || [],
      interests: user.interests || [],
      lookingFor: user.lookingFor || [],
      location: user.location,
      experienceLevel: user.experienceLevel,
      isPremium: user.isPremium,
      membershipType: user.membershipType,
      createdAt: user.createdAt,
    };

    // If viewing own profile, include email
    const isOwnProfile = id === loggedInUserId;
    if (isOwnProfile) {
      profileData.email = user.email;
    }

    res.json({
      success: true,
      isOwnProfile,
      data: profileData
    });

  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ 
      error: "Failed to fetch profile. Please try again later." 
    });
  }
});

module.exports = { profileRouter };