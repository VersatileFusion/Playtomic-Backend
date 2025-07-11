const express = require("express");
const router = express.Router();
const prisma = require("../models/prisma");
const authenticate = require("../middlewares/authMiddleware");
const requireAdmin = require("../middlewares/adminMiddleware");

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get("/users", authenticate, requireAdmin, async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

/**
 * @swagger
 * /admin/clubs:
 *   get:
 *     summary: List all clubs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of clubs
 */
router.get("/clubs", authenticate, requireAdmin, async (req, res) => {
  const clubs = await prisma.club.findMany();
  res.json(clubs);
});

/**
 * @swagger
 * /admin/coaches:
 *   get:
 *     summary: List all coaches
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of coaches
 */
router.get("/coaches", authenticate, requireAdmin, async (req, res) => {
  const coaches = await prisma.coach.findMany({
    include: { user: true, clubs: true },
  });
  res.json(coaches);
});

/**
 * @swagger
 * /admin/bookings:
 *   get:
 *     summary: List all bookings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get("/bookings", authenticate, requireAdmin, async (req, res) => {
  const bookings = await prisma.booking.findMany({
    include: { user: true, court: true, coach: true, payment: true },
  });
  res.json(bookings);
});

/**
 * @swagger
 * /admin/payments:
 *   get:
 *     summary: List all payments
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of payments
 */
router.get("/payments", authenticate, requireAdmin, async (req, res) => {
  const payments = await prisma.payment.findMany({
    include: { booking: true },
  });
  res.json(payments);
});

module.exports = router;
