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

        if (!membershipAmount[membershipType]) {
            return res.status(400).json({ message: "Invalid membership type" });
        }

        const { firstName, lastName, emailId } = req.user;

        const order = await razorpayInstance.orders.create({
            amount: membershipAmount[membershipType] * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            notes: { firstName, lastName, emailId, membershipType },
        });

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
        const signature = req.get("X-Razorpay-Signature");

        const isValid = validateWebhookSignature(
            req.rawBody, // raw body (see app.js change below)
            signature,
            process.env.RAZORPAY_WEBHOOK_SECRET,
        );

        if (!isValid) {
            console.error("[webhook] Invalid signature");
            return res
                .status(400)
                .json({ message: "Webhook signature not valid!" });
        }

        const event = req.body.event;
        const paymentDetails = req.body.payload.payment.entity;
        console.log(
            "[webhook]",
            event,
            paymentDetails.order_id,
            paymentDetails.status,
        );

        // 1. Authorized → capture it (Razorpay then sends payment.captured)
        if (event === "payment.authorized") {
            try {
                await razorpayInstance.payments.capture(
                    paymentDetails.id,
                    paymentDetails.amount,
                    paymentDetails.currency,
                );
                console.log("[webhook] Captured", paymentDetails.id);
            } catch (err) {
                console.error(
                    "[webhook] Capture failed:",
                    err.error?.description || err.message,
                );
            }
            return res.status(200).json({ message: "Authorized handled" });
        }

        // 2. Update the payment record
        const payment = await Payment.findOne({
            orderId: paymentDetails.order_id,
        });
        if (!payment) {
            console.error(
                "[webhook] No payment found for",
                paymentDetails.order_id,
            );
            return res
                .status(200)
                .json({ message: "Order not found, ignored" });
        }

        payment.status = paymentDetails.status; // "captured" or "failed"
        await payment.save();

        // 3. Only a captured payment makes the user premium
        if (event === "payment.captured") {
            const user = await User.findById(payment.userId);
            if (user) {
                user.isPremium = true;
                user.membershipType = payment.notes.membershipType;
                await user.save();
                console.log("[webhook] User upgraded:", user._id.toString());
            }
        }

        return res
            .status(200)
            .json({ message: "Webhook received successfully" });
    } catch (error) {
        console.error("[webhook] Error:", error.message);
        return res.status(500).json({ message: error.message });
    }
});

module.exports = paymentRouter;
