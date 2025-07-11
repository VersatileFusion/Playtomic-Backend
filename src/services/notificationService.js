const notifications = new Map();

function sendNotification(userId, message) {
  if (!notifications.has(userId)) notifications.set(userId, []);
  notifications.get(userId).push({ message, date: new Date() });
}

function getNotifications(userId) {
  return notifications.get(userId) || [];
}

module.exports = { sendNotification, getNotifications };
