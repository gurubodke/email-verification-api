const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendVerificationEmail = async (email, token) => {

  const link = `http://localhost:3000/api/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "Verify your email",
    html: `<p>Click to verify your email</p>
           <a href="${link}">${link}</a>`
  });
};

module.exports = sendVerificationEmail;