const express = require('express');
const { userAuth } = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');
const userRouter = express.Router();

const USER_SAFE_DATA = "firstName lastName photoURL about skills";

userRouter.get('/user/requests/received', userAuth, async (req, res) => {

    try {

        const loggedInUser = req.user;

        const connectionRequests = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: 'interested'
        }).populate("fromUserId", USER_SAFE_DATA)

        res.json({ message : "Data fetched successfully", data : connectionRequests });

    } catch (err) {

        res.status(500).json({ message: `ERROR : ${err.message}`});
    }
});

userRouter.get('/user/connections', userAuth, async (req, res) => {

    try {

        const loggedInUser = req.user;

        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { toUserId : loggedInUser._id, status: 'accepted' },
                { fromUserId : loggedInUser._id, status: 'accepted' }
            ]
        }).populate("fromUserId", USER_SAFE_DATA).populate("toUserId", USER_SAFE_DATA);

        const data = connectionRequests.map(item => {
            if(item.fromUserId.equals(loggedInUser._id)) {
                return item.toUserId;
            }
            return item.fromUserId;
        });

        res.json({ message: "Data fetched successfully", data });

    } catch (err) {

        res.status(400).json({ message: err.message});
    }
});

userRouter.get('/feed', userAuth, async (req, res) => {

    try {

        let limit = req.query.limit || 10;
        limit = limit > 50 ? 50 : limit;

        const page = req.query.page || 1;
        const skip = (page - 1) * limit;

        const loggedInUser = req.user;

        // User should see users in the feed except
        // 1. own card
        // 2. connections
        // 3. ignored connections
        // 4. interested connections

        const existingConnections = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id },
                { toUserId: loggedInUser._id }
            ]
        }).select("fromUserId toUserId");

        const hideUsers = new Set();

        existingConnections.forEach(req => {
            hideUsers.add(req.fromUserId.toString());
            hideUsers.add(req.toUserId.toString());
        });

        const result = await User.find({
            $and : [
                {_id : { $nin: Array.from(hideUsers) } },
                { _id : { $ne: loggedInUser._id } }
            ]
        }).select(USER_SAFE_DATA).skip(skip).limit(limit);

        res.json({ message : "Data fetched successfully", data : result });
        
    } catch (err) {

        res.status(400).json({ message: err.message });
    }
});

module.exports = userRouter;