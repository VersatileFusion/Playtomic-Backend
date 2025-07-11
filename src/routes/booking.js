const express = require("express");
const router = express.Router();
const prisma = require("../models/prisma");
const authenticate = require("../middlewares/authMiddleware");
const { validate, z } = require("../utils/validation");

/**
 * @swagger
 * tags:
 *   name: Booking
 *   description: Booking management
 */

/**
 * @swagger
 * /booking:
 *   get:
 *     summary: List all bookings (user-specific)
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get("/", authenticate, async (req, res) => {
  const bookings = await prisma.booking.findMany({
    where: { userId: req.user.userId },
    include: { court: true, coach: true, payment: true },
  });
  res.json(bookings);
});

/**
 * @swagger
 * /booking/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Booking]
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
 *         description: Booking details
 */
router.get("/:id", authenticate, async (req, res) => {
  const booking = await prisma.booking.findUnique({
    where: { id: Number(req.params.id) },
    include: { court: true, coach: true, payment: true },
  });
  if (!booking || booking.userId !== req.user.userId)
    return res.status(404).json({ error: "Booking not found" });
  res.json(booking);
});

/**
 * @swagger
 * /booking:
 *   post:
 *     summary: Create a new booking
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courtId:
 *                 type: integer
 *               coachId:
 *                 type: integer
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Booking created
 */
const createBookingSchema = z.object({
  courtId: z.number().int(),
  coachId: z.number().int().optional(),
  startTime: z.string(),
  endTime: z.string(),
  price: z.number(),
});
router.post(
  "/",
  authenticate,
  validate(createBookingSchema),
  async (req, res) => {
    const { courtId, coachId, startTime, endTime, price } = req.body;
    const booking = await prisma.booking.create({
      data: {
        userId: req.user.userId,
        courtId,
        coachId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        price,
        status: "pending",
      },
    });
    res.status(201).json(booking);
  }
);

/**
 * @swagger
 * /booking/{id}/status:
 *   put:
 *     summary: Update booking status (paid, cancelled, etc.)
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking status updated
 */
const updateStatusSchema = z.object({
  status: z.string(),
});
router.put(
  "/:id/status",
  authenticate,
  validate(updateStatusSchema),
  async (req, res) => {
    const { status } = req.body;
    const booking = await prisma.booking.update({
      where: { id: Number(req.params.id) },
      data: { status },
    });
    res.json(booking);
  }
);

/**
 * @swagger
 * /booking/{id}:
 *   delete:
 *     summary: Cancel a booking
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       204:
 *         description: Booking cancelled
 */
router.delete("/:id", authenticate, async (req, res) => {
  await prisma.booking.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
});

module.exports = router;
