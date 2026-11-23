const express = require("express");

const paymentRouter = express.Router();

const { userAuth } = require("../middlewares/auth");

const razorpayInstance = require("../utils/razorpay");
const { membershipAmount } = require("../utils/constants");
const Payment = require("../models/payment");
const User = require("../models/user");
const {
    validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
    try {
        const { membershipType } = req.body;
        const { firstName, lastName, emailId } = req.user;
        const order = await razorpayInstance.orders.create({
            amount: membershipAmount[membershipType] * 100,
            currency: "INR",
            receipt: "receipt#1",
            notes: {
                firstName,
                lastName,
                emailId,
                membershipType: membershipType,
            },
        });

        console.log(order);

        const payment = new Payment({
            userId: req.user._id,
            orderId: order.id,
            status: order.status,
            amount: order.amount,
            currency: order.currency,
            notes: order.notes,
            receipt: order.receipt,
        });

        const savedPayment = await payment.save();

        res.json({
            message: "Order created successfully",
            data: savedPayment,
            keyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

paymentRouter.post("/payment/webhook", async (req, res) => {
    try {
        const webhookSignature = req.get("X-Razorpay-Signature");
        console.log(webhookSignature, "webhookSignature");

        const isWebhookValid = validateWebhookSignature(
            JSON.stringify(req.body),
            webhookSignature,
            process.env.RAZORPAY_WEBHOOK_SECRET,
        );
        console.log(isWebhookValid, "isWebhookValid");

        if (!isWebhookValid) {
            return res
                .status(400)
                .json({ message: "Webhook signature not valid!" });
        }

        // Update payment status
        // Update User to premium

        const paymentDetails = req.body.payload.payment.entity;
        console.log(paymentDetails, "paymentDetails");

        const payment = await Payment.findOne({
            orderId: paymentDetails.order_id,
        });
        payment.status = paymentDetails.status;

        await payment.save();

        const user = await User.findById({ _id: payment.userId });
        user.isPremium = true;
        user.membershipType = payment.notes.membershipType;

        await user.save();

        return res
            .status(200)
            .json({ message: "Webhook received successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

paymentRouter.get("/premium/verify", userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.json({ isPremium: user.isPremium });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = paymentRouter;
