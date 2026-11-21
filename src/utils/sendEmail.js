const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_ADDRESS = "DevTinder <noreply@sakthivelmunusami.in>";

const sendMail = async ({ to, subject, html, text }) => {
    const { data, error } = await resend.emails.send({
        from: FROM_ADDRESS,
        to,
        subject,
        html,
        text: text || subject,
    });

    if (error) throw new Error(error.message);
    return data;
};

module.exports = { sendMail };
