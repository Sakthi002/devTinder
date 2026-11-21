const cron = require("node-cron");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const ConnectionRequest = require("../models/connectionRequest");
const { sendMail } = require("./sendEmail");

// 8:00 AM every day, India time. For testing, temporarily use "* * * * *".
cron.schedule(
    "0 8 * * *",
    async () => {
        try {
            const yesterday = subDays(new Date(), 1);
            const start = startOfDay(yesterday);
            const end = endOfDay(yesterday);

            const pendingRequests = await ConnectionRequest.find({
                status: "interested",
                createdAt: { $gte: start, $lte: end },
            }).populate("toUserId", "firstName emailId");

            const emailIds = [
                ...new Set(
                    pendingRequests
                        .map((item) => item.toUserId?.emailId)
                        .filter(Boolean),
                ),
            ];

            console.log(
                `[cron] ${emailIds.length} users with pending requests`,
            );

            for (const email of emailIds) {
                // one at a time, waits for each
                try {
                    await sendMail({
                        to: email,
                        subject:
                            "You have pending connection requests on DevTinder",
                        html: `<p>You have new connection requests waiting on DevTinder.</p>
                   <p><a href="https://sakthivelmunusami.in/requests">Review them now</a></p>`,
                        text: "You have new connection requests waiting on DevTinder: https://sakthivelmunusami.in/requests",
                    });
                    console.log(`[cron] Email sent to ${email}`);
                } catch (err) {
                    console.error(
                        `[cron] Email failed for ${email}:`,
                        err.message,
                    );
                }
            }
        } catch (err) {
            console.error("[cron] Job failed:", err.message);
        }
    },
    { timezone: "Asia/Kolkata" },
);
