require("dotenv").config();
const express = require("express");

const connectDB = require("./config/database");

const app = express();

app.use(express.json());

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const cors = require("cors");
app.use(cors({ origin: "https://sakthivelmunusami.in", credentials: true }));

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

connectDB()
    .then((res) => {
        console.log("Database connected successfully");

        app.listen(3000, () => {
            console.log("Server running successfully at port 3000!!!!!!!!!!!");
        });
    })
    .catch((e) => {
        console.error("Error::Not connected to Database");
    });
