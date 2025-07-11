const otpStore = new Map();

function generateOTP(phone) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phone, { otp, expires: Date.now() + 5 * 60 * 1000 }); // 5 min expiry
  return otp;
}

function verifyOTP(phone, otp) {
  const record = otpStore.get(phone);
  if (!record) return false;
  if (record.otp !== otp) return false;
  if (Date.now() > record.expires) {
    otpStore.delete(phone);
    return false;
  }
  otpStore.delete(phone);
  return true;
}

module.exports = { generateOTP, verifyOTP };
