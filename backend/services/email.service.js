const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD;

if (!EMAIL_USER || !EMAIL_APP_PASSWORD) {
  console.warn('EMAIL CONFIG MISSING: EMAIL_USER or EMAIL_APP_PASSWORD');
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_APP_PASSWORD
  }
});

const sendOTPEmail = async (to, otp, type) => {
  const subject =
    type === 'registration'
      ? 'Chutki Registration OTP'
      : 'Chutki Password Reset OTP';

  const purpose =
    type === 'registration'
      ? 'complete your Chutki registration'
      : 'reset your Chutki password';

  await transporter.sendMail({
    from: `"Chutki" <${EMAIL_USER}>`,
    to,
    subject,
    text:
      `Your Chutki OTP is ${otp}.\n\n` +
      `Use this OTP to ${purpose}.\n` +
      `This OTP is valid for 5 minutes.\n\n` +
      `If you did not request this, please ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;">
        <h2>Chutki</h2>
        <p>Your OTP to ${purpose} is:</p>

        <div style="
          font-size:30px;
          font-weight:bold;
          letter-spacing:8px;
          padding:15px;
          background:#f5f5f5;
          text-align:center;
          border-radius:8px;
        ">
          ${otp}
        </div>

        <p>This OTP is valid for <b>5 minutes</b>.</p>
        <p>If you did not request this OTP, please ignore this email.</p>

        <p style="color:#777;font-size:12px;">
          This is an automated email from Chutki.
        </p>
      </div>
    `
  });
};

const verifyEmailConnection = async () => {
  await transporter.verify();
  return true;
};

module.exports = {
  sendOTPEmail,
  verifyEmailConnection
};
