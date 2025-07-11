const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authMiddleware");
const {
  sendNotification,
  getNotifications,
} = require("../services/notificationService");
const { sendPush } = require("../services/pushNotificationService");

/**
 * @swagger
 * tags:
 *   name: Notification
 *   description: Notification management (mock)
 */

/**
 * @swagger
 * /notification:
 *   get:
 *     summary: Get notifications for current user
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get("/", authenticate, (req, res) => {
  const notifications = getNotifications(req.user.userId);
  res.json(notifications);
});

/**
 * @swagger
 * /notification:
 *   post:
 *     summary: Send a notification to current user (mock, for testing)
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notification sent
 */
router.post("/", authenticate, (req, res) => {
  const { message } = req.body;
  sendNotification(req.user.userId, message);
  res.status(201).json({ message: "Notification sent" });
});

/**
 * @swagger
 * /notification/push:
 *   post:
 *     summary: Send a push notification to current user (mock, for testing)
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Push notification sent
 */
router.post("/push", authenticate, async (req, res) => {
  const { title, message } = req.body;
  await sendPush(req.user.userId, title, message);
  res.status(201).json({ message: "Push notification sent" });
});

module.exports = router;
