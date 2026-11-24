# REAL-TIME CHAT WITH WEBSOCKETS & SOCKET.IO (DEVTINDER)

## 1. CONCEPTS

### HTTP vs WebSocket

- HTTP: client asks → server answers → connection done. The server can't push data on its own.
- Polling (asking the server every few seconds) wastes requests and still feels delayed.
- WebSocket: one long-lived, two-way connection. Server and client can send messages anytime → real-time.
- Starts as a normal HTTP request, then "upgrades" to WebSocket (status 101 Switching Protocols).

### Socket.io

- Library on top of WebSockets (server: socket.io, client: socket.io-client).
- Adds: auto-reconnect, fallback to HTTP polling, events, rooms.
- Default path: /socket.io/

### Key terms

- emit(event, data) → send an event
- on(event, handler) → listen for an event
- Room → a group of sockets; messages sent to a room reach only its members
- io.to(roomId).emit(...) → send to everyone in a room (including the sender)

### Chat flow

```
User A opens chat ──joinChat──► server puts A in room (A+B)
User B opens chat ──joinChat──► server puts B in the same room
User A sends text ──sendMessage──► server saves to MongoDB
                                  ──messageReceived──► everyone in the room (A and B)
Page refresh → GET /chat/:targetUserId → load history from MongoDB
```

---

## 2. INSTALL

```bash
# backend
npm install socket.io

# frontend
npm install socket.io-client
```

---

## 3. BACKEND

### Chat model (src/models/chat.js)

```js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema(
    {
        senderId: {# WEBSOCKETS

### What is socket.io?

- Socket.io is a library which enables low-latency, bidirectional and event based communication between client and server

### Websocket vs HTTP

- HTTP protocal is used communication between client and server - Client sends a request - server process it and sends response
- Websocket is a communcation protocal which allows client and server to exchange data over a persistant connection - Once the connection established both sides can send messages.
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: { type: String, required: true },
    },
    { timestamps: true }, // createdAt for each message
);

const chatSchema = new Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],
        messages: [messageSchema],
    },
    { timestamps: true },
);

chatSchema.index({ participants: 1 });

module.exports = mongoose.model("Chat", chatSchema);
```

- One chat document per pair of users; messages stored inside it.
- Fine for learning. A MongoDB document is limited to 16 MB → for very long chats, use a separate Message collection.

### Attach socket.io to the HTTP server (src/app.js)

- socket.io needs the raw HTTP server, not just the Express app.

```js
require("dotenv").config();
const express = require("express");
const http = require("http");
const initializeSocket = require("./utils/socket");

const app = express();
// ...middlewares and routers
app.use("/", require("./routes/chat"));

const server = http.createServer(app);
initializeSocket(server);

connectDB().then(() => {
    server.listen(process.env.PORT, () => console.log("Server running")); // server.listen, not app.listen
});
```

### Socket server (src/utils/socket.js)

```js
const socket = require("socket.io");
const crypto = require("crypto");
const Chat = require("../models/chat");

// Same room for both users, hashed so room IDs aren't guessable
const getSecretRoomId = (userId, targetUserId) =>
    crypto
        .createHash("sha256")
        .update([userId, targetUserId].sort().join("_"))
        .digest("hex");

const initializeSocket = (server) => {
    const io = socket(server, {
        cors: {# WEBSOCKETS

### What is socket.io?

- Socket.io is a library which enables low-latency, bidirectional and event based communication between client and server

### Websocket vs HTTP

- HTTP protocal is used communication between client and server - Client sends a request - server process it and sends response
- Websocket is a communcation protocal which allows client and server to exchange data over a persistant connection - Once the connection established both sides can send messages.
            origin: ["http://localhost:5173", "https://sakthivelmunusami.in"],
            credentials: true,
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
                try {
                    if (!text?.trim()) return;
                    const roomId = getSecretRoomId(userId, targetUserId);

                    let chat = await Chat.findOne({
                        participants: { $all: [userId, targetUserId] },
                    });
                    if (!chat) {
                        chat = new Chat({
                            participants: [userId, targetUserId],
                            messages: [],
                        });
                    }

                    chat.messages.push({ senderId: userId, text: text.trim() });
                    await chat.save();

                    const savedMessage =
                        chat.messages[chat.messages.length - 1];

                    io.to(roomId).emit("messageReceived", {
                        senderId: userId,
                        firstName,
                        lastName,
                        photoURL,
                        text: savedMessage.text,
                        createdAt: savedMessage.createdAt,
                    });
                } catch (error) {
                    console.error(
                        "[socket] sendMessage failed:",
                        error.message,
                    );
                }
            },
        );

        socket.on("disconnect", () => {});
    });
};

module.exports = initializeSocket;
```

- Sorting the two IDs → A+B and B+A give the same room.
- The client sends one object → destructure it in the handler: ({ firstName, userId, targetUserId }).

### Chat history route (src/routes/chat.js)

```js
const express = require("express");
const mongoose = require("mongoose");
const { userAuth } = require("../middlewares/auth");
const Chat = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");

const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
    try {
        const userId = req.user._id;
        const { targetUserId } = req.params; // destructure, not req.params itself

        if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
            return res.status(400).json({ message: "Invalid user id" });
        }

        // Only connected users can chat
        const isConnected = await ConnectionRequest.findOne({
            status: "accepted",
            $or: [
                { fromUserId: userId, toUserId: targetUserId },
                { fromUserId: targetUserId, toUserId: userId },
            ],
        });
        if (!isConnected) {
            return res
                .status(403)
                .json({ message: "You can only chat with your connections" });
        }

        let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
        })
            .populate("messages.senderId", "firstName lastName photoURL")
            .populate("participants", "firstName lastName photoURL");

        if (!chat) {
            chat = new Chat({
                participants: [userId, targetUserId],
                messages: [],
            });
            await chat.save(); // save only new chats
            await chat.populate("participants", "firstName lastName photoURL");
        }

        res.json(chat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message }); // always respond
    }
});

module.exports = chatRouter;
```

---

## 4. FRONTEND

### Socket connection (src/utils/socket.js)

```js
import { io } from "socket.io-client";

const createSocketConnection = () => io({ withCredentials: true });
// No URL → same site; default path /socket.io (proxied by Vite locally, nginx in production)

export default createSocketConnection;
```

- Don't pass API_BASE_URL ("/api") → socket.io treats "/api" as a namespace, not a URL.

### Route (App.jsx)

```jsx
<Route path="/chat/:targetUserId" element={<Chat />} />
```

### Chat component (src/components/Chat.jsx)

```jsx
import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import createSocketConnection from "../utils/socket";
import { API_BASE_URL } from "../utils/constant";

const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

function Chat() {
    const { targetUserId } = useParams();
    const user = useSelector((store) => store.user);
    const userId = user?._id;

    const [messages, setMessages] = useState([]);
    const [targetUser, setTargetUser] = useState(null);
    const [text, setText] = useState("");

    const socketRef = useRef(null); // one socket per chat page
    const bottomRef = useRef(null); // auto-scroll marker

    // Load history (reload when switching chats)
    useEffect(() => {
        const fetchChat = async () => {
            try {
                const res = await axios.get(
                    API_BASE_URL + "/chat/" + targetUserId,
                    {
                        withCredentials: true,
                    },
                );

                setMessages(
                    res.data.messages.map((msg) => ({
                        senderId: msg?.senderId?._id,
                        firstName: msg?.senderId?.firstName,
                        lastName: msg?.senderId?.lastName,
                        photoURL: msg?.senderId?.photoURL,
                        text: msg.text,
                        createdAt: msg.createdAt,
                    })),
                );

                // Use the URL id, not userId (Redux user may not be loaded yet)
                setTargetUser(
                    res.data.participants.find((p) => p._id === targetUserId),
                );
            } catch (error) {
                console.error(error);
            }
        };

        fetchChat();
    }, [targetUserId]);

    // Socket: join room + listen
    useEffect(() => {
        if (!userId) return;

        const socket = createSocketConnection();
        socketRef.current = socket;

        socket.emit("joinChat", {
            firstName: user.firstName,
            userId,
            targetUserId,
        });

        socket.on("messageReceived", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => socket.disconnect(); // cleanup on leave / chat switch
    }, [userId, targetUserId]);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (!text.trim() || !socketRef.current) return;
        socketRef.current.emit("sendMessage", {
            firstName: user.firstName,
            lastName: user.lastName,
            photoURL: user.photoURL,
            userId,
            targetUserId,
            text: text.trim(),
        });
        setText("");
    };

    if (!user) return null;

    return (
        <div className="flex justify-center px-4 py-6">
            <div className="card w-full max-w-2xl h-[75vh] bg-base-100 shadow-md border border-base-300 flex flex-col">
                {/* Header: the other person */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-base-300">
                    <div className="avatar">
                        <div className="w-10 rounded-full">
                            <img
                                src={targetUser?.photoURL}
                                alt={targetUser?.firstName || "User"}
                            />
                        </div>
                    </div>
                    <h2 className="font-semibold">
                        {targetUser
                            ? `${targetUser.firstName} ${targetUser.lastName || ""}`
                            : "Chat"}
                    </h2>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 bg-base-200/40">
                    {messages.map((msg, index) => {
                        const fromMe = msg.senderId === userId;
                        return (
                            <div
                                key={index}
                                className={`chat ${fromMe ? "chat-end" : "chat-start"}`}
                            >
                                {!fromMe && (
                                    <div className="chat-image avatar">
                                        <div className="w-10 rounded-full">
                                            <img
                                                alt={msg.firstName}
                                                src={msg.photoURL}
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className="chat-header">
                                    {msg.firstName} {msg.lastName}
                                </div>
                                <div
                                    className={`chat-bubble ${fromMe ? "chat-bubble-neutral" : ""}`}
                                >
                                    {msg.text}
                                </div>
                                <div className="chat-footer opacity-50 text-xs mt-1">
                                    {msg.createdAt && formatTime(msg.createdAt)}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="flex items-center gap-2 px-4 py-3 border-t border-base-300">
                    <input
                        type="text"
                        className="input w-full"
                        placeholder="Type a message..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <button
                        className="btn btn-neutral"
                        onClick={sendMessage}
                        disabled={!text.trim()}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Chat;
```

### Key frontend points

- useRef for the socket → one connection reused for every message (creating a socket per send leaks connections).
- senderId === userId → your messages on the right (chat-end), theirs on the left (chat-start).
- Cleanup (socket.disconnect) when leaving the page or switching chats.
- Header uses targetUserId from the URL to find the other participant.

---

## 5. LOCAL SETUP (VITE PROXY)

- The frontend calls /api and /socket.io on its own origin; Vite forwards both to Node.

```js
// vite.config.js
server: {
  proxy: {
    "/api": {
      target: "http://localhost:3000",
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ""),
    },
    "/socket.io": {
      target: "http://localhost:3000",
      ws: true, // proxy WebSocket upgrades
      changeOrigin: true,
    },
  },
},
```

- Restart Vite after changing the config.

---

## 6. PRODUCTION (NGINX)

- On the server there's no Vite → nginx must forward /socket.io/ to Node.
- Without it, nginx serves index.html for /socket.io/ → chat doesn't connect.

```nginx
# /etc/nginx/sites-available/default, inside server { }
location /socket.io/ {
    proxy_pass http://localhost:3000;            # no trailing slash: keep /socket.io in the path
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;      # required for WebSockets
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 86400;                    # keep long-lived connections open
}
```

```bash
sudo nginx -t
sudo systemctl restart nginx
```

- /api/ → proxy_pass http://localhost:3000/; (trailing slash strips /api)
- /socket.io/ → proxy_pass http://localhost:3000; (no slash, path kept)
- Cloudflare → Network → WebSockets: On (default)

### Deploy

```bash
# backend
cd ~/devTinder && git pull && npm install && pm2 restart devtinder-backend

# frontend
cd ~/devTinder-web && git pull && npm install && npm run build && sudo cp -r dist/* /var/www/html/
```

---

## 7. TESTING

### Check socket.io is reachable

```bash
curl "https://sakthivelmunusami.in/socket.io/?EIO=4&transport=polling"
```

- 0{"sid":"...","upgrades":["websocket"],...} → working
- HTML (<!doctype html>) → nginx /socket.io/ block missing
- 502 → backend down

### Chat test

1. Normal window: log in as user A → open /chat/<B's id>
2. Incognito window: log in as user B → open /chat/<A's id>
3. Send messages from both sides

- Messages appear instantly in both windows, own messages on the right
- DevTools → Network → filter socket.io → status 101 Switching Protocols
- Server logs: "... joined the room - ..."
- Refresh → messages still there (loaded from MongoDB)

---

## 8. TROUBLESHOOTING (LESSONS LEARNED)

- console shows Socket {connected: false}
    - Logged immediately after io(); connection is async. Use socket.on("connect", ...) to check.
- "[object Object] joined the room - \_"
    - Client sends one object, server expected separate arguments → destructure ({ firstName, userId, targetUserId })
- Socket never connects locally
    - io(API_BASE_URL) with "/api" → treated as a namespace → use io() + Vite /socket.io proxy with ws: true
- Works locally, not in production
    - nginx missing location /socket.io/ with Upgrade/Connection headers
- Header shows your own name
    - fetchChat ran before Redux user loaded → find the participant by targetUserId
- All messages on the left
    - senderId missing in mapped history or socket payload
- Request hangs on error
    - catch block must send a response
- New connection on every message
    - Creating a socket inside sendMessage → keep it in useRef
- Anyone can chat with anyone
    - Check the users are connected (accepted request) in the route, and also in the socket handler
