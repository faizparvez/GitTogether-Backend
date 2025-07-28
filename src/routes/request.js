const express = require("express");
const requestRouter = express.Router();
const { Request } = require("../models/request");
const { userAuth } = require("../middlewares/auth");
const { User } = require("../models/user");

requestRouter.post("/request/send/:status/:toUserId",
    userAuth,
    async (req,res)=>{
    try{
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

// check 1: if the status of the request is accepted or rejected, then we can't do the api call        
        if(!["ignored","interested"].includes(status)){
            throw new Error("Invalid connection request");
        }

// check 2: if there is already such a connection request present in DB => a to b  OR from b to a (both are same)
        const existingRequest = await Request.findOne({
            $or: [           // using or for more than 1 cond
                {fromUserId, toUserId},
                {fromUserId: toUserId, toUserId: fromUserId}
            ]
        }); 

        if(existingRequest){
            throw new Error("Connection Request has already been sent");
        }


// check 3: if the request is sent to some user not present in the DB
        const toUser = await User.findById(toUserId);
        if(!toUser){
            throw new Error("User not found");
        }  
        
// check 4: if the request is sent to yourself, we can also do it using the schema pre func just like schema methods 
        if( fromUserId.equals(toUserId) ){
            throw new Error("Invalid Connection Request");
        } 
        
        const request = new Request({
            fromUserId,
            toUserId,
            status
        })

        await request.save();
        res.json({
            message:"Connection request sent successfully",
            data : request
        });
    }
    catch(err){
        res.status(404).send("ERROR: "+err.message);
    }
})

requestRouter.post("request/received/:status/:reqId",
    userAuth,
    async (req, res) => {

    }
)

module.exports = {requestRouter};