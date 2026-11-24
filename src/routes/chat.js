const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Chat = require("../models/chat");
const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
    try {
        const user = req.user;
        const userId = user._id;

        const { targetUserId } = req.params;

        let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
        })
            .populate({
                path: "messages.senderId",
                select: "firstName lastName photoURL",
            })
            .populate("participants", "firstName lastName photoURL");

        if (!chat) {
            chat = new Chat({
                participants: [userId, targetUserId],
                messages: [],
            });
            await chat.populate("participants", "firstName lastName photoURL");
        }

        await chat.save();

        res.send(chat);
    } catch (error) {
        console.error(error);
    }
});
module.exports = chatRouter;
