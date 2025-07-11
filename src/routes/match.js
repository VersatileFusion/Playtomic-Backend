const express = require("express");
const router = express.Router();
const prisma = require("../models/prisma");
const authenticate = require("../middlewares/authMiddleware");
const { v4: uuidv4 } = require("uuid");

/**
 * @swagger
 * tags:
 *   name: Match
 *   description: Matchmaking system
 */

/**
 * @swagger
 * /match:
 *   post:
 *     summary: Create a new match (public or private)
 *     tags: [Match]
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
 *               type:
 *                 type: string
 *                 enum: [friendly, competitive]
 *               courtId:
 *                 type: integer
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               capacity:
 *                 type: integer
 *                 enum: [2, 4]
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Match created
 */
router.post("/", authenticate, async (req, res) => {
  const { title, type, courtId, startTime, capacity, isPublic } = req.body;
  let inviteLink = null;
  if (!isPublic) inviteLink = uuidv4();
  const match = await prisma.match.create({
    data: {
      title,
      type,
      hostId: req.user.userId,
      courtId,
      startTime: new Date(startTime),
      capacity,
      status: "open",
      isPublic,
      inviteLink,
      players: { connect: { id: req.user.userId } },
    },
    include: { players: true },
  });
  res.status(201).json(match);
});

/**
 * @swagger
 * /match/public:
 *   get:
 *     summary: List all public open matches
 *     tags: [Match]
 *     responses:
 *       200:
 *         description: List of public matches
 */
router.get("/public", async (req, res) => {
  const matches = await prisma.match.findMany({
    where: { isPublic: true, status: "open" },
    include: { players: true },
  });
  res.json(matches);
});

/**
 * @swagger
 * /match/{id}:
 *   get:
 *     summary: Get match by ID
 *     tags: [Match]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Match details
 */
router.get("/:id", async (req, res) => {
  const match = await prisma.match.findUnique({
    where: { id: Number(req.params.id) },
    include: { players: true, invites: true },
  });
  if (!match) return res.status(404).json({ error: "Match not found" });
  res.json(match);
});

/**
 * @swagger
 * /match/{id}/join:
 *   post:
 *     summary: Join a public match
 *     tags: [Match]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Joined match
 */
router.post("/:id/join", authenticate, async (req, res) => {
  const match = await prisma.match.findUnique({
    where: { id: Number(req.params.id) },
    include: { players: true },
  });
  if (!match || !match.isPublic || match.status !== "open")
    return res.status(400).json({ error: "Cannot join match" });
  if (match.players.some((p) => p.id === req.user.userId))
    return res.status(400).json({ error: "Already joined" });
  if (match.players.length >= match.capacity)
    return res.status(400).json({ error: "Match is full" });
  await prisma.match.update({
    where: { id: match.id },
    data: { players: { connect: { id: req.user.userId } } },
  });
  res.json({ message: "Joined match" });
});

/**
 * @swagger
 * /match/invite/{inviteLink}:
 *   post:
 *     summary: Request to join a private match via invite link
 *     tags: [Match]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inviteLink
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Join request sent
 */
router.post("/invite/:inviteLink", authenticate, async (req, res) => {
  const match = await prisma.match.findFirst({
    where: { inviteLink: req.params.inviteLink, isPublic: false },
  });
  if (!match) return res.status(404).json({ error: "Match not found" });
  await prisma.matchInvite.create({
    data: { matchId: match.id, userId: req.user.userId, status: "pending" },
  });
  res.json({ message: "Join request sent" });
});

/**
 * @swagger
 * /match/invite/{inviteId}/respond:
 *   post:
 *     summary: Host accepts or rejects a join request
 *     tags: [Match]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inviteId
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [accept, reject]
 *     responses:
 *       200:
 *         description: Invite responded
 */
router.post("/invite/:inviteId/respond", authenticate, async (req, res) => {
  const { action } = req.body;
  const invite = await prisma.matchInvite.findUnique({
    where: { id: Number(req.params.inviteId) },
    include: { match: true },
  });
  if (!invite) return res.status(404).json({ error: "Invite not found" });
  if (invite.match.hostId !== req.user.userId)
    return res.status(403).json({ error: "Not authorized" });
  if (action === "accept") {
    await prisma.matchInvite.update({
      where: { id: invite.id },
      data: { status: "accepted" },
    });
    await prisma.match.update({
      where: { id: invite.matchId },
      data: { players: { connect: { id: invite.userId } } },
    });
    return res.json({ message: "Invite accepted" });
  } else {
    await prisma.matchInvite.update({
      where: { id: invite.id },
      data: { status: "rejected" },
    });
    return res.json({ message: "Invite rejected" });
  }
});

/**
 * @swagger
 * /match/{id}/close:
 *   post:
 *     summary: Host closes the match
 *     tags: [Match]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Match closed
 */
router.post("/:id/close", authenticate, async (req, res) => {
  const match = await prisma.match.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!match) return res.status(404).json({ error: "Match not found" });
  if (match.hostId !== req.user.userId)
    return res.status(403).json({ error: "Not authorized" });
  await prisma.match.update({
    where: { id: match.id },
    data: { status: "closed" },
  });
  res.json({ message: "Match closed" });
});

module.exports = router;
