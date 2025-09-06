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


// email & password can't be edited
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try{
    const valid = validateEditprofileData(req);
    if(valid){
      const loggedinuser = req.user;
      
      Object.keys(req.body).forEach((key)=>{
        loggedinuser[key]=req.body[key];
      });

      await loggedinuser.save();
      res.json({
        message:`${loggedinuser.firstName}, your profile is updated successfully !`,
        data:loggedinuser
      });
    }
    else{
      throw new Error("Invalid Edit Request");
    }
  }
  catch(err){
    res.status(404).send("ERROR: "+err.message);
  }
});



module.exports = { profileRouter };