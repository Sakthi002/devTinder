require("dotenv").config();
const express = require("express");

const connectDB = require("./config/database");

const app = express();

app.use(
    express.json({
        verify: (req, res, buf) => {
            req.rawBody = buf.toString();
        },
    }),
);

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

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);

const nseRouter = require("./routes/nseTicker");
app.use("/", nseRouter);

connectDB()
    .then((res) => {
        console.log("Database connected successfully");

        app.listen(process.env.PORT, () => {
            console.log("Server running successfully at port 3000!!!!!!!!!!!");
        });
    })
    .catch((e) => {
        console.error("Error::Not connected to Database");
    });

require("./utils/cronJobs");
