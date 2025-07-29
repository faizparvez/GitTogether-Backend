const mongoose = require("mongoose");
const { User } = require("./user");

const requestSchema = new mongoose.Schema({
    fromUserId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref: User
    },
    toUserId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref: User
    },
    status:{
        type:String,
        required:true,
        enum:{
            values:["ignore","interested","accepted","rejected"],
            message:`{VALUE} is not a correct status`
        }
    }
},{
    timestamps:true
});


requestSchema.index({ fromUserId: 1, toUserId: 1 });


// kind of middleware called everytime whenever we save a request, func called before we save the request 
requestSchema.pre( "save", function( next ){
    const request = this;
    if( request.toUserId.equals(request.fromUserId) ){
        throw new Error("Invalid Connection Request"); 
    }
    next();         //imp
} );



const Request = new mongoose.model("Request", requestSchema);

module.exports = {Request};