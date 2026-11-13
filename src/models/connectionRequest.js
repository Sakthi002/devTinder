const mongoose = require("mongoose");
const { Schema } = mongoose;

const connectRequestSchema = new Schema({

    fromUserId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User"
    },

    toUserId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User"
    },

    status: {
        type: String,
        required: true,
        enum: {
            values: ['interested', 'ignored', 'accepted', 'rejected'],
            message: "{VALUE} is not a valid status"
        }
    }

},{ timestamps: true });

connectRequestSchema.pre('save', function() {

    const connectRequest = this;

    if(connectRequest.fromUserId.equals(connectRequest.toUserId)) {

        throw new Error("You cant send request to you")
    }
});

connectRequestSchema.index({ fromUserId: 1, toUserId: 1 });

const ConnectionRequest = mongoose.model('ConnectionRequest', connectRequestSchema);

module.exports = ConnectionRequest;