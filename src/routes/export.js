const express = require("express");
const router = express.Router();
const prisma = require("../models/prisma");
const authenticate = require("../middlewares/authMiddleware");
const requireAdmin = require("../middlewares/adminMiddleware");
const { Parser } = require("json2csv");

/**
 * @swagger
 * tags:
 *   name: Export
 *   description: Export data as CSV (admin)
 */

function sendCSV(res, data, filename) {
  const parser = new Parser();
  const csv = parser.parse(data);
  res.header("Content-Type", "text/csv");
  res.attachment(filename);
  res.send(csv);
}

/**
 * @swagger
 * /export/users:
 *   get:
 *     summary: Export all users as CSV
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file
 */
router.get("/users", authenticate, requireAdmin, async (req, res) => {
  const users = await prisma.user.findMany();
  sendCSV(res, users, "users.csv");
});

/**
 * @swagger
 * /export/bookings:
 *   get:
 *     summary: Export all bookings as CSV
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file
 */
router.get("/bookings", authenticate, requireAdmin, async (req, res) => {
  const bookings = await prisma.booking.findMany();
  sendCSV(res, bookings, "bookings.csv");
});

/**
 * @swagger
 * /export/payments:
 *   get:
 *     summary: Export all payments as CSV
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file
 */
router.get("/payments", authenticate, requireAdmin, async (req, res) => {
  const payments = await prisma.payment.findMany();
  sendCSV(res, payments, "payments.csv");
});

module.exports = router;
