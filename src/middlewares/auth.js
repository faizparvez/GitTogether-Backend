const jwt = require("jsonwebtoken");
const {User} = require("../models/user");

// check if token present => verify token => attach the user
const userAuth = async (req, res, next)=>{
try{
  const cookies = req.cookies;
  // console.log(cookies);

  const { token } = cookies;
  if(!token){
    // 401 -> denotes the user is unauthorized
    res.status(401).send("Please Login");
  }

  const decodedMessage = await jwt.verify(token, "28@ugust22");
  // console.log(decodedMessage);

  const {_id}=decodedMessage;
  const user=await User.findById(_id);
  if(!user){
    throw new Error("Invalid Credentials");
  }
  
  req.user=user;
  next();
  }
  catch(err){
    res.status(400).send("ERROR : "+ err.message);
  }
};

module.exports={userAuth};