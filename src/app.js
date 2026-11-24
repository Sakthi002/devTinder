require("dotenv").config();
const express = require("express");
const http = require("http");
const initializeSocket = require("./utils/socket");

const connectDB = require("./config/database");

const app = express();

app.use(express.json());

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const cors = require("cors");
app.use(
    cors({
        origin: ["http://localhost:5173", "https://sakthivelmunusami.in"],
        credentials: true,
    }),
);

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payment");
const chatRouter = require("./routes/chat");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);
app.use("/", chatRouter);

const nseRouter = require("./routes/nseTicker");
app.use("/", nseRouter);

const server = http.createServer(app);

initializeSocket(server);

connectDB()
    .then((res) => {
        console.log("Database connected successfully");

        server.listen(process.env.PORT, () => {
            console.log("Server running successfully at port 3000!!!!!!!!!!!");
        });
    })
    .catch((e) => {
        console.error("Error::Not connected to Database");
    });

require("./utils/cronJobs");
