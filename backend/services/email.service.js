const axios = require('axios');

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL =
  process.env.BREVO_SENDER_EMAIL || 'support@chutki.online';
const SENDER_NAME =
  process.env.BREVO_SENDER_NAME || 'Chutki';

const BREVO_API_URL = 'https://api.brevo.com/v3';

const sendOTPEmail = async (to, otp, type) => {
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not configured');
  }

  const isRegistration = type === 'registration';

  const subject = isRegistration
    ? 'Chutki Registration OTP'
    : 'Chutki Password Reset OTP';

  const purpose = isRegistration
    ? 'complete your Chutki registration'
    : 'reset your Chutki password';

  const text =
    `Your Chutki OTP is ${otp}.\n\n` +
    `Use this OTP to ${purpose}.\n` +
    'This OTP is valid for 5 minutes.\n\n' +
    'If you did not request this, please ignore this email.';

  const html = `
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
      ">${otp}</div>
      <p>This OTP is valid for <b>5 minutes</b>.</p>
      <p>If you did not request this OTP, please ignore this email.</p>
      <p style="color:#777;font-size:12px;">
        This is an automated email from Chutki.
      </p>
    </div>
  `;

  try {
    const response = await axios.post(
      `${BREVO_API_URL}/smtp/email`,
      {
        sender: {
          name: SENDER_NAME,
          email: SENDER_EMAIL
        },
        to: [{ email: to }],
        subject,
        textContent: text,
        htmlContent: html,
        tags: ['chutki-otp', isRegistration ? 'registration' : 'password-reset']
      },
      {
        headers: {
          accept: 'application/json',
          'api-key': BREVO_API_KEY,
          'content-type': 'application/json'
        },
        timeout: 15000
      }
    );

    return response.data;
  } catch (error) {
    const status = error.response?.status;
    const detail =
      error.response?.data?.message ||
      error.response?.data?.code ||
      error.message;

    console.error(
      'BREVO OTP EMAIL ERROR:',
      status ? `HTTP ${status}` : 'Network error',
      detail
    );

    throw new Error(
      `Brevo OTP email delivery failed${status ? ` (HTTP ${status})` : ''}`
    );
  }
};

const verifyEmailConnection = async () => {
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not configured');
  }

  try {
    await axios.get(`${BREVO_API_URL}/account`, {
      headers: {
        accept: 'application/json',
        'api-key': BREVO_API_KEY
      },
      timeout: 15000
    });

    return true;
  } catch (error) {
    const status = error.response?.status;
    console.error(
      'BREVO API CONNECTION ERROR:',
      status ? `HTTP ${status}` : 'Network error',
      error.response?.data?.message || error.message
    );

    throw new Error('Brevo API connection verification failed');
  }
};

module.exports = {
  sendOTPEmail,
  verifyEmailConnection
};
