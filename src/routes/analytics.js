const express = require("express");
const router = express.Router();
const prisma = require("../models/prisma");
const authenticate = require("../middlewares/authMiddleware");
const requireAdmin = require("../middlewares/adminMiddleware");

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: System analytics and reporting
 */

/**
 * @swagger
 * /analytics/stats:
 *   get:
 *     summary: Get system stats (users, bookings, revenue)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System stats
 */
router.get("/stats", authenticate, requireAdmin, async (req, res) => {
  const users = await prisma.user.count();
  const bookings = await prisma.booking.count();
  const revenue = await prisma.payment.aggregate({ _sum: { amount: true } });
  res.json({ users, bookings, revenue: revenue._sum.amount || 0 });
});

/**
 * @swagger
 * /analytics/bookings/daily:
 *   get:
 *     summary: Get daily booking trends (last 30 days)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daily booking trends
 */
router.get("/bookings/daily", authenticate, requireAdmin, async (req, res) => {
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const bookings = await prisma.booking.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  });
  const trends = {};
  bookings.forEach((b) => {
    const day = b.createdAt.toISOString().slice(0, 10);
    trends[day] = (trends[day] || 0) + 1;
  });
  res.json(trends);
});

module.exports = router;
