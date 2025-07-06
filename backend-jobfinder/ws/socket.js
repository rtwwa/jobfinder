const jwt = require("jsonwebtoken");
const User = require("../models/User");

const connectedUsers = new Map();

function setupSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.userId = user._id;
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.name}`);
    connectedUsers.set(socket.userId.toString(), socket.id);

    socket.join(`user_${socket.userId}`);

    socket.on("sendMessage", async (data) => {
      try {
        const { Message, Conversation } = require("../models/Message");

        const conversation = await Conversation.findById(
          data.conversationId
        ).populate("participants", "name email");

        if (!conversation) return;

        const message = new Message({
          conversationId: data.conversationId,
          sender: socket.userId,
          content: data.content,
        });

        await message.save();

        conversation.lastMessage = message._id;
        await conversation.save();

        const populatedMessage = await Message.findById(message._id).populate(
          "sender",
          "name email"
        );

        conversation.participants.forEach((participant) => {
          const participantSocketId = connectedUsers.get(
            participant._id.toString()
          );
          if (participantSocketId) {
            io.to(participantSocketId).emit("newMessage", populatedMessage);
          }
        });
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.name}`);
      connectedUsers.delete(socket.userId.toString());
    });
  });
}

function notifyNewVacancy(vacancy, io) {
  const { User } = require("../models/User");

  User.find({ role: "jobseeker" }).then((users) => {
    users.forEach((user) => {
      const socketId = connectedUsers.get(user._id.toString());
      if (socketId) {
        io.to(socketId).emit("newVacancy", vacancy);
      }
    });
  });
}

module.exports = { setupSocket, notifyNewVacancy };
