const { SendEmailCommand } = require("@aws-sdk/client-ses");
const { sesClient } = require("./sesClient");

const FROM_ADDRESS = "DevTinder <noreply@sakthivelmunusami.in>";

const sendMail = async ({ to, subject, html, text }) => {
  const command = new SendEmailCommand({
    Source: FROM_ADDRESS,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Charset: "UTF-8", Data: subject },
      Body: {
        Html: { Charset: "UTF-8", Data: html },
        Text: { Charset: "UTF-8", Data: text || subject },
      },
    },
  });

  return sesClient.send(command);
};

module.exports = { sendMail };