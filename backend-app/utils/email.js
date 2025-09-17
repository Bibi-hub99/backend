const nodemailer = require("nodemailer");

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.GOOGLE_EMAIL_ACCOUNT,
    pass: process.env.GOOGLE_EMAIL_PASSWORD,
  },
});

// Wrap in an async IIFE so we can use await.


const sendMail = async ({clientEmail,subject,message,fileName}) => {
  const info = await transporter.sendMail({
    from: 'Travel.com',
    to: clientEmail,
    subject: subject,
    html:message,
     // HTML body
    attachments:[
        {
            filename:fileName,
            contentType:"application/json"
        }
    ]
  });

  console.log("Message sent:", info.messageId);
}

module.exports = {sendMail}