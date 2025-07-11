let admin = null;
let fcmReady = false;
try {
  admin = require("firebase-admin");
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }
    fcmReady = true;
  }
} catch (e) {
  // firebase-admin not installed or not configured
}

/**
 * userId: the user to send to (should map to a device token in a real app)
 * title, message: notification content
 * For demo, expects userId to be a device token if FCM is enabled
 */
async function sendPush(userId, title, message) {
  if (fcmReady) {
    try {
      const payload = {
        notification: { title, body: message },
      };
      const response = await admin.messaging().sendToDevice(userId, payload);
      return response;
    } catch (err) {
      console.error("FCM push error:", err.message);
      return false;
    }
  } else {
    // Fallback: log to console
    console.log(`[PUSH] To: ${userId} | Title: ${title} | Message: ${message}`);
    return true;
  }
}

module.exports = { sendPush };
