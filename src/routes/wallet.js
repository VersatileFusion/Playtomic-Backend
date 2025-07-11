const express = require("express");
const router = express.Router();
const prisma = require("../models/prisma");
const authenticate = require("../middlewares/authMiddleware");
const { validate, z } = require("../utils/validation");

/**
 * @swagger
 * tags:
 *   name: Wallet
 *   description: User wallet management
 */

/**
 * @swagger
 * /wallet:
 *   get:
 *     summary: Get current user's wallet balance
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet balance
 */
router.get("/", authenticate, async (req, res) => {
  let wallet = await prisma.wallet.findUnique({
    where: { userId: req.user.userId },
  });
  if (!wallet)
    wallet = await prisma.wallet.create({ data: { userId: req.user.userId } });
  res.json({ balance: wallet.balance });
});

/**
 * @swagger
 * /wallet/transactions:
 *   get:
 *     summary: Get wallet transaction history
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of wallet transactions
 */
router.get("/transactions", authenticate, async (req, res) => {
  let wallet = await prisma.wallet.findUnique({
    where: { userId: req.user.userId },
  });
  if (!wallet)
    wallet = await prisma.wallet.create({ data: { userId: req.user.userId } });
  const transactions = await prisma.walletTransaction.findMany({
    where: { walletId: wallet.id },
  });
  res.json(transactions);
});

/**
 * @swagger
 * /wallet/topup:
 *   post:
 *     summary: Top up wallet balance (mock)
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Wallet topped up
 */
const topupSchema = z.object({ amount: z.number().positive() });
router.post("/topup", authenticate, validate(topupSchema), async (req, res) => {
  const { amount } = req.body;
  let wallet = await prisma.wallet.findUnique({
    where: { userId: req.user.userId },
  });
  if (!wallet)
    wallet = await prisma.wallet.create({ data: { userId: req.user.userId } });
  await prisma.wallet.update({
    where: { id: wallet.id },
    data: { balance: { increment: amount } },
  });
  await prisma.walletTransaction.create({
    data: { walletId: wallet.id, type: "topup", amount, status: "completed" },
  });
  res.json({ message: "Wallet topped up" });
});

/**
 * @swagger
 * /wallet/withdraw:
 *   post:
 *     summary: Withdraw from wallet (mock)
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Withdrawal successful
 */
const withdrawSchema = z.object({ amount: z.number().positive() });
router.post(
  "/withdraw",
  authenticate,
  validate(withdrawSchema),
  async (req, res) => {
    const { amount } = req.body;
    let wallet = await prisma.wallet.findUnique({
      where: { userId: req.user.userId },
    });
    if (!wallet)
      wallet = await prisma.wallet.create({
        data: { userId: req.user.userId },
      });
    if (wallet.balance < amount)
      return res.status(400).json({ error: "Insufficient balance" });
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: amount } },
    });
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "withdraw",
        amount,
        status: "completed",
      },
    });
    res.json({ message: "Withdrawal successful" });
  }
);

/**
 * @swagger
 * /wallet/pay:
 *   post:
 *     summary: Pay for a booking using wallet
 *     tags: [Wallet]
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
 *     responses:
 *       200:
 *         description: Payment successful
 */
const paySchema = z.object({ bookingId: z.number().int() });
router.post("/pay", authenticate, validate(paySchema), async (req, res) => {
  const { bookingId } = req.body;
  let wallet = await prisma.wallet.findUnique({
    where: { userId: req.user.userId },
  });
  if (!wallet)
    wallet = await prisma.wallet.create({ data: { userId: req.user.userId } });
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.userId !== req.user.userId)
    return res.status(404).json({ error: "Booking not found" });
  if (wallet.balance < booking.price)
    return res.status(400).json({ error: "Insufficient balance" });
  await prisma.wallet.update({
    where: { id: wallet.id },
    data: { balance: { decrement: booking.price } },
  });
  await prisma.walletTransaction.create({
    data: {
      walletId: wallet.id,
      type: "payment",
      amount: booking.price,
      status: "completed",
      meta: `bookingId:${bookingId}`,
    },
  });
  await prisma.payment.create({
    data: {
      bookingId,
      amount: booking.price,
      status: "paid",
      method: "wallet",
    },
  });
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "paid" },
  });
  res.json({ message: "Payment successful" });
});

module.exports = router;
