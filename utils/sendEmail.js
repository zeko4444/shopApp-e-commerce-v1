const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1) create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT, //if secure false port =587 , if secure true port 465
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define email options
  const mailOptions = {
    from: "E-shop App <elzeny08@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3)send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
