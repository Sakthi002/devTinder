const mongoose = require("mongoose");
const { Schema } = mongoose;

const connectRequestSchema = new Schema({

    fromUserId: {
        type: mongoose.Types.ObjectId,
        required: true
    },

    toUserId: {
        type: mongoose.Types.ObjectId,
        required: true
    },

    status: {
        type: String,
        enum: {
            values: ['interested', 'ignored', 'accepted', 'rejected'],
            message: "{VALUE} is not a valid status"
        }
    }

},{ timestamps: true });

connectRequestSchema.pre('save', function(next) {

    const connectRequest = this;

    if(connectRequest.fromUserId.equals(connectRequest.toUserId)) {

        throw new Error("You cant send request to you")
    }

    next()

});

connectRequestSchema.index({ fromUserId: 1, toUserId: 1 });

const ConnectionRequest = mongoose.model('ConnectionRequest', connectRequestSchema);

module.exports = ConnectionRequest;