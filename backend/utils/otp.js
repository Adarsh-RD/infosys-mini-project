// backend/utils/otp.js

const otpStore = {}; // { phone: { otp, verified, expiresAt } }

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function sendOTP(phone) {
  const otp = generateOTP();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  otpStore[phone] = {
    otp,
    verified: false,
    expiresAt
  };

  console.log(`[DEMO OTP] OTP for ${phone}: ${otp} (valid 5 minutes)`);

  return otp;
}

function verifyOTP(phone, otp) {
  const entry = otpStore[phone];
  if (!entry) return false;

  if (Date.now() > entry.expiresAt) {
    console.log(`OTP for ${phone} expired`);
    delete otpStore[phone];
    return false;
  }

  if (entry.otp !== otp) {
    return false;
  }

  entry.verified = true;
  return true;
}

function isVerified(phone) {
  const entry = otpStore[phone];
  if (!entry) return false;

  if (Date.now() > entry.expiresAt) {
    delete otpStore[phone];
    return false;
  }

  return entry.verified === true;
}

module.exports = { sendOTP, verifyOTP, isVerified };
