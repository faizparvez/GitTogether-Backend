const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const { Request } = require("../models/request.js");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("$"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: ["https://gitt-together.vercel.app", "http://localhost:5173"],
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"], // CRITICAL FOR PRODUCTION
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    // handle events
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(firstName + " joined Room : " + roomId);
      socket.join(roomId);
    });

    socket.on(
  "sendMessage",
  async ({ firstName, lastName, userId, targetUserId, text }) => {
    try {
      const roomId = getSecretRoomId(userId, targetUserId);

      const existingRequest = await Request.findOne({
        $or: [
          { fromUserId: userId, toUserId: targetUserId, status: "accepted" },
          { fromUserId: targetUserId, toUserId: userId, status: "accepted" },
        ],
      });

      if (!existingRequest) {
        throw new Error("Target user is not a connection");
      }

      let chat = await Chat.findOne({
        participants: { $all: [userId, targetUserId] },
      });

      if (!chat) {
        chat = new Chat({
          participants: [userId, targetUserId],
          messages: [],
        });
      }

      chat.messages.push({
        senderId: userId,
        text,
      });

      await chat.save();

      // ✅ FIX: Get the saved message WITH timestamp
      const savedMessage = chat.messages[chat.messages.length - 1];

      io.to(roomId).emit("messageReceived", {
        senderId: userId,
        firstName,
        lastName,
        text,
        createdAt: savedMessage.createdAt,
      });
    } catch (err) {
      console.log(err);
    }
  }
);


    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
