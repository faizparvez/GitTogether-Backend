const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { Request } = require("../models/request");
const { User } = require("../models/user");

const user_safedata = "firstName lastName photoURL age gender about skills";

userRouter.get("/user/requests", userAuth, async (req, res) => {
  try {
    const loggedinuser = req.user;

    const requests = await Request.find({
      toUserId: loggedinuser,
      status: "interested",
    }).populate("fromUserId", user_safedata);

    res.json({
      message: "Connection Requests",
      data: requests,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedinuser = req.user;

    // we want the requests which have status = accepted & either toUserId or fromUserId = loginUserId
    const requests = await Request.find({
      $or: [
        { toUserId: loggedinuser._id, status: "accepted" },
        { fromUserId: loggedinuser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", user_safedata)
      .populate("toUserId", user_safedata);

    const data = requests.map((request) => {
      if (request.fromUserId.equals(loggedinuser._id)) {
        return request.toUserId;
      } else {
        return request.fromUserId;
      }
    });

    res.send(data);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

userRouter.get("/user/feed", userAuth, async (req, res) => {
  /* checks: user should see all the users except:
   - his own card
   - users whom he has rejected/ ignored
   - users who are his connections 
   - users to whom he has already sent the connection request
*/

  try {
    const loggedinuser = req.user;

    const page = parseInt(req.query.page) || 1; // if the page is not passed, we assume it to be 1
    let limit = parseInt(req.query.limit) || 10;
    // validate limit, it should not exceed 10
    if (limit > 10) {
      limit = 10;
    }

    const skip = (page - 1) * limit;

    // find all requests sent or received by the user
    const requests = await Request.find({
      $or: [{ fromUserId: loggedinuser._id }, { toUserId: loggedinuser._id }],
    }).select("fromUserId toUserId");

    // the users present in the "toUserId" or "fromUserId" of the above requests should not be present in the feed, so we store them in a hashset
    const removeUsers = new Set(); // declaring a set
    requests.forEach((ele) => {
      removeUsers.add(ele.fromUserId.toString());
      removeUsers.add(ele.toUserId.toString());
    });

    // now, we will fetch all the users from our user colln which are not present in the set, by writing a reverse query
    const validUsers = await User.find({
      $and: [
        { _id: { $nin: Array.from(removeUsers) } }, // "$nin" denotes "not be present in" & "Array.from( removeUsers )" converts a set into an array
        { _id: { $ne: loggedinuser._id } },         // "$ne" denotes "not equal to"
      ],
    })
      .select(user_safedata)
      .skip(skip)
      .limit(limit);

    res.send(validUsers);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = { userRouter };
