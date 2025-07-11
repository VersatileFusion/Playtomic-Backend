const express = require("express");
const router = express.Router();
const prisma = require("../models/prisma");
const authenticate = require("../middlewares/authMiddleware");
const {
  initiatePayment,
  verifyPayment,
} = require("../services/paymentGatewayService");
const { logAudit } = require("../services/auditLogger");

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment management
 */

/**
 * @swagger
 * /payment:
 *   get:
 *     summary: List all payments (user-specific)
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of payments
 */
router.get("/", authenticate, async (req, res) => {
  const payments = await prisma.payment.findMany({
    where: {
      booking: {
        userId: req.user.userId,
      },
    },
    include: { booking: true },
  });
  res.json(payments);
});

/**
 * @swagger
 * /payment/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payment]
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
 *         description: Payment details
 */
router.get("/:id", authenticate, async (req, res) => {
  const payment = await prisma.payment.findUnique({
    where: { id: Number(req.params.id) },
    include: { booking: true },
  });
  if (!payment || payment.booking.userId !== req.user.userId)
    return res.status(404).json({ error: "Payment not found" });
  res.json(payment);
});

/**
 * @swagger
 * /payment:
 *   post:
 *     summary: Create a new payment (mock)
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: integer
 *               amount:
 *                 type: number
 *               method:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment created
 */
router.post("/", authenticate, async (req, res) => {
  const { bookingId, amount, method } = req.body;
  logAudit({ userId: req.user.userId, action: "payment_create", details: { bookingId, amount, method } });
  // In a real app, integrate with payment gateway here
  const payment = await prisma.payment.create({
    data: {
      bookingId,
      amount,
      status: "paid",
      method,
    },
  });
  // Update booking status
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "paid" },
  });
  res.status(201).json(payment);
});

/**
 * @swagger
 * /payment/initiate:
 *   post:
 *     summary: Initiate a payment via gateway
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: integer
 *               amount:
 *                 type: number
 *               method:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment initiated
 */
router.post("/initiate", authenticate, async (req, res) => {
  const { bookingId, amount, method } = req.body;
  const result = await initiatePayment({
    amount,
    userId: req.user.userId,
    bookingId,
    method,
  });
  res.json(result);
});

/**
 * @swagger
 * /payment/verify:
 *   post:
 *     summary: Verify a payment via gateway
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transactionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified
 */
router.post("/verify", authenticate, async (req, res) => {
  const { transactionId } = req.body;
  const result = await verifyPayment({ transactionId });
  res.json(result);
});

/**
 * @swagger
 * /payment/{id}/refund:
 *   post:
 *     summary: Refund a payment (mock)
 *     tags: [Payment]
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
 *         description: Payment refunded
 */
router.post("/:id/refund", authenticate, async (req, res) => {
  logAudit({ userId: req.user.userId, action: "payment_refund", details: { paymentId: req.params.id } });
  const payment = await prisma.payment.update({
    where: { id: Number(req.params.id) },
    data: { status: "refunded" },
  });
  // Update booking status
  await prisma.booking.update({
    where: { id: payment.bookingId },
    data: { status: "cancelled" },
  });
  res.json(payment);
});

module.exports = router;
