const socket = require("socket.io");
const crypto = require("crypto");
const Chat = require("../models/chat");

const getSecretRoomId = (userId, targetUserId) => {
    return crypto
        .createHash("sha256")
        .update([userId, targetUserId].sort().join("_"))
        .digest("hex");
};
const intializeSocket = (server) => {
    const io = socket(server, {
        cors: {
            origin: "http://localhost:5173",
        },
    });

    io.on("connection", (socket) => {
        socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
            const roomId = getSecretRoomId(userId, targetUserId);
            console.log(firstName + " joined the room - " + roomId);
            socket.join(roomId);
        });

        socket.on(
            "sendMessage",
            async ({
                firstName,
                lastName,
                photoURL,
                userId,
                targetUserId,
                text,
            }) => {
                const roomId = getSecretRoomId(userId, targetUserId);

                try {
                    let chat = await Chat.findOne({
                        participants: { $all: [userId, targetUserId] },
                    });

                    if (!chat) {
                        chat = new Chat({
                            participants: [userId, targetUserId],
                            messages: [],
                        });
                    }
                    chat.messages.push({ senderId: userId, text });

                    await chat.save();

                    const savedMessage =
                        chat.messages[chat.messages.length - 1];

                    io.to(roomId).emit("messageReceived", {
                        senderId: userId,
                        firstName,
                        lastName,
                        photoURL,
                        text,
                        createdAt: savedMessage.createdAt,
                    });
                } catch (error) {
                    console.error(error);
                }
            },
        );

        socket.on("disconnect", () => {});
    });
};

module.exports = intializeSocket;
