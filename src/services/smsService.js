const axios = require("axios");

const KAVENEGAR_API_KEY = process.env.KAVENEGAR_API_KEY;
const KAVENEGAR_SENDER = process.env.KAVENEGAR_SENDER || "10004346";

async function sendSMS(phone, message) {
  if (KAVENEGAR_API_KEY) {
    try {
      const url = `https://api.kavenegar.com/v1/${KAVENEGAR_API_KEY}/sms/send.json`;
      const params = {
        receptor: phone,
        message,
        sender: KAVENEGAR_SENDER,
      };
      const res = await axios.post(url, null, { params });
      if (res.data.return.status === 200) return true;
      throw new Error("Kavenegar SMS failed");
    } catch (err) {
      console.error("Kavenegar SMS error:", err.message);
      return false;
    }
  } else {
    // Fallback: log to console
    console.log(`[SMS] To: ${phone} | Message: ${message}`);
    return true;
  }
}

module.exports = { sendSMS };
