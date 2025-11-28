const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { Chat } = require("../models/chat");
const { User } = require("../models/user"); 

const chatRouter = express.Router();

// api to fetch the chats
chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName _id",
    });

    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      });
      await chat.save();
    }

    // Fetch lastSeen from DB
    const targetUser = await User.findById(targetUserId).select("lastSeen");

    // Send chat + lastSeen to frontend
    res.json({
      chat,
      lastSeen: targetUser?.lastSeen || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = chatRouter;
