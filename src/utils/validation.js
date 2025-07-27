const validator = require("validator");

const validateSignupData = (req)=>{
    const {firstName, lastName, email, password} = req.body;
    if(!firstName){
        throw new Error("Invaid FirstName");
    }
    else if(!lastName){
        throw new Error("Invaid LastName");
    }
    else if(!validator.isEmail(email)){
        throw new Error("Invalid Email");
    }
    else if(!validator.isStrongPassword(password)){
        throw new Error("Create a stronger password !");
    }
}


const validateEditprofileData = (req)=>{
    const allowedEditFields=[
      "firstName",
      "lastName",
      "email",
      "photoUrl",
      "gender",
      "age",
      "about",
      "skills"
    ];

    if(Object.keys(req.body).includes("password") || Object.keys(req.body).includes("email")){
      return false;
    }
    else{
      return true;
    }
}


module.exports = {validateSignupData, validateEditprofileData};