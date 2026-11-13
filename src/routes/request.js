const express = require("express");
const requestRouter = express.Router();

const { userAuth } = require('../middlewares/auth');
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

requestRouter.post('/request/send/:status/:toUserId', userAuth, async (req, res) => {

    try {

        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        // Edge Cases
        // 1. Should work only for interested and ignored
        const ALLOWED_STATUSES = ['interested', 'ignored'];
        if(!ALLOWED_STATUSES.includes(status)) {
            return res.status(400).json({ message: "Invalid status type"})
        }
        // 2. toUserId should be present in the DB
        const toUser = await User.findById(toUserId);
       
        if(!toUser) {
            return res.status(400).json({ message: "Invalid user"})
        }
        // 3. Already connection should not exist between from adn to user
        const connectionExists = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        })

        if(connectionExists) {
            return res.status(400).json({ message: "Connection already exists"})
        }

        // 4. Request should not to be made to same from user
        // Logic written in Schema

        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });

        await connectionRequest.save();

        res.json({ message: "Connection request sent", data: connectionRequest });

    } catch(e) {

        res.status(400).send('ERROR : ' + e.message);
        
    }
})

requestRouter.post('/request/review/:status/:requestId', userAuth, async (req, res) => {

    try {

        // 1. request status must be intrested
        // 2. toUserId of request should loogedIn user Id
        // 3. Only acccepted and rejected status allowed
        // 4. requestId should be valid

        const loggedInUser = req.user;
        const { status, requestId } = req.params;

        const allowedStatuses = ['accepted', 'rejected'];

        if(!allowedStatuses.includes(status)) {

            return res.status(400).json({ message: "Status not allowed"});
        }

        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: 'interested'
        })

        if(!connectionRequest) {

            return res.status(404).json({ message: `Connection request not found`})
        }

        connectionRequest.status = status;
        
        const data = await connectionRequest.save();

        res.json({ message: `Connection request ${status}`, data})

    } catch(err) {

        res.status(500).json({ messgae : `ERROR : ${err.message}`})
    }
});

module.exports = requestRouter;
