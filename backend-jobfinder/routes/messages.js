const express = require("express");
const { Message, Conversation } = require("../models/Message");
const User = require("../models/User");
const auth = require("../middleware/auth");

let io;

function setIO(ioInstance) {
  io = ioInstance;
}

const router = express.Router();

router.get("/conversations", auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "name email")
      .populate("lastMessage")
      .populate("vacancy", "title company")
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.get("/:conversationId", auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation || !conversation.participants.includes(req.user._id)) {
      return res.status(404).json({ message: "Беседа не найдена" });
    }

    const messages = await Message.find({
      conversationId: req.params.conversationId,
    })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.post("/:conversationId", auth, async (req, res) => {
  try {
    const { content } = req.body;
    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation || !conversation.participants.includes(req.user._id)) {
      return res.status(404).json({ message: "Беседа не найдена" });
    }

    const message = new Message({
      conversationId: req.params.conversationId,
      sender: req.user._id,
      content,
    });

    await message.save();

    conversation.lastMessage = message._id;
    await conversation.save();

    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "name email"
    );

    if (io) {
      const populatedConversation = await Conversation.findById(
        req.params.conversationId
      ).populate("participants", "name email");

      populatedConversation.participants.forEach((participant) => {
        io.to(`user_${participant._id}`).emit("newMessage", populatedMessage);
      });
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.post("/conversations/create", auth, async (req, res) => {
  try {
    const { participantId, vacancyId } = req.body;

    const existingConversation = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId] },
    });

    if (existingConversation) {
      return res.json(existingConversation);
    }

    const conversation = new Conversation({
      participants: [req.user._id, participantId],
      vacancy: vacancyId,
    });

    await conversation.save();

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate("participants", "name email")
      .populate("vacancy", "title company");

    res.status(201).json(populatedConversation);
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = { router, setIO };
