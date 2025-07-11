const express = require("express");
const router = express.Router();
const prisma = require("../models/prisma");
const authenticate = require("../middlewares/authMiddleware");
const requireAdmin = require("../middlewares/adminMiddleware");

/**
 * @swagger
 * tags:
 *   name: Badge
 *   description: Gamification badges
 */

/**
 * @swagger
 * /badge:
 *   get:
 *     summary: List all badges
 *     tags: [Badge]
 *     responses:
 *       200:
 *         description: List of badges
 */
router.get("/", async (req, res) => {
  const badges = await prisma.badge.findMany();
  res.json(badges);
});

/**
 * @swagger
 * /badge/award:
 *   post:
 *     summary: Award a badge to a user (admin only)
 *     tags: [Badge]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               badgeId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Badge awarded
 */
router.post("/award", authenticate, requireAdmin, async (req, res) => {
  const { userId, badgeId } = req.body;
  const userBadge = await prisma.userBadge.create({
    data: { userId, badgeId },
  });
  res.status(201).json(userBadge);
});

/**
 * @swagger
 * /badge/user:
 *   get:
 *     summary: List badges for current user
 *     tags: [Badge]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user badges
 */
router.get("/user", authenticate, async (req, res) => {
  const userBadges = await prisma.userBadge.findMany({
    where: { userId: req.user.userId },
    include: { badge: true },
  });
  res.json(userBadges);
});

module.exports = router;
