const express = require("express");
const router = express.Router();
const prisma = require("../models/prisma");
const authenticate = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Message
 *   description: Messaging between users/coaches
 */

/**
 * @swagger
 * /message:
 *   post:
 *     summary: Send a message to another user (optionally for a match)
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receiverId:
 *                 type: integer
 *               text:
 *                 type: string
 *               matchId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Message sent
 */
router.post("/", authenticate, async (req, res) => {
  const { receiverId, text, matchId } = req.body;
  const message = await prisma.message.create({
    data: {
      senderId: req.user.userId,
      receiverId,
      text,
      matchId,
    },
  });
  res.status(201).json(message);
});

/**
 * @swagger
 * /message/conversation/{userId}:
 *   get:
 *     summary: List all messages between current user and another user
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get("/conversation/:userId", authenticate, async (req, res) => {
  const userId = Number(req.params.userId);
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: req.user.userId, receiverId: userId },
        { senderId: userId, receiverId: req.user.userId },
      ],
    },
    orderBy: { createdAt: "asc" },
  });
  res.json(messages);
});

/**
 * @swagger
 * /message/match/{matchId}:
 *   get:
 *     summary: List all messages for a match
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get("/match/:matchId", authenticate, async (req, res) => {
  const matchId = Number(req.params.matchId);
  const messages = await prisma.message.findMany({
    where: { matchId },
    orderBy: { createdAt: "asc" },
  });
  res.json(messages);
});

module.exports = router;
