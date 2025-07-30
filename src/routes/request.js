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

requestRouter.post("/request/review/:status/:reqId",
    userAuth,
    async (req, res) => {
        try{
            const loggedinuser = req.user;
                        
// check 1 : validate the "status" & "reqId" present in the route, i.e route parameters ( req.params )
            const { status, reqId } = req.params;
            if(!["accepted","rejected"].includes(status)){
                throw new Error("Invalid Connection Request");
            }
            
// check 2 : we'll see all the requests in which the toUserId = ID OF THE LOGGEDIN USER
// check 3 : the status OF THE PENDING REQUEST should be interested
            const request = await Request.findOne({
                _id: reqId,
                toUserId: loggedinuser._id,
                status: "interested"
            });
            
            if(!request){
                throw new Error("Invalid Connection Request");
            }

            request.status = status;
            const data = await request.save();

            res.json({
                message:`Connection request ${status}`,
                data: request
            });
        }
        catch(err){
            res.status(400).send("ERROR: "+err.message);
        }
    }
)

module.exports = {requestRouter};