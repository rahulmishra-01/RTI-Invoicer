const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service:"Gmail",
    host:"smtp.gmail.com",
    port:465,
    secure:true,
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS,
    },
});

exports.sendOTP = async (to, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Your Login OTP",
    html: `<p>Your OTP is <strong>${otp}</strong>. It is valid for 5 minutes.</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
