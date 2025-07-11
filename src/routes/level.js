const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authMiddleware");
const prisma = require("../models/prisma");
const { getUserLevel } = require("../services/levelService");

/**
 * @swagger
 * tags:
 *   name: Level
 *   description: User level and gamification
 */

/**
 * @swagger
 * /level/me:
 *   get:
 *     summary: Get current user's level and progress
 *     tags: [Level]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User level and progress
 */
router.get("/me", authenticate, async (req, res) => {
  const level = await getUserLevel(req.user.userId);
  res.json(level);
});

/**
 * @swagger
 * /level/leaderboard:
 *   get:
 *     summary: Get top users by level (leaderboard)
 *     tags: [Level]
 *     responses:
 *       200:
 *         description: Leaderboard
 */
router.get("/leaderboard", async (req, res) => {
  // Top 10 users by booking count
  const users = await prisma.user.findMany({
    include: { bookings: true },
  });
  const leaderboard = users
    .map((u) => ({
      id: u.id,
      name: u.name,
      phone: u.phone,
      bookings: u.bookings.length,
      level: Math.min(1 + Math.floor(u.bookings.length / 5), 7),
    }))
    .sort((a, b) => b.level - a.level || b.bookings - a.bookings)
    .slice(0, 10);
  res.json(leaderboard);
});

module.exports = router;
