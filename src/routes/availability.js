const express = require("express");
const router = express.Router();
const prisma = require("../models/prisma");
const authenticate = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Availability
 *   description: Coach/club schedule management
 */

/**
 * @swagger
 * /availability:
 *   post:
 *     summary: Set coach availability for a club and day
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clubId:
 *                 type: integer
 *               dayOfWeek:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 6
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *     responses:
 *       201:
 *         description: Availability set
 */
router.post("/", authenticate, async (req, res) => {
  const { clubId, dayOfWeek, startTime, endTime } = req.body;
  const coach = await prisma.coach.findUnique({
    where: { userId: req.user.userId },
  });
  if (!coach) return res.status(403).json({ error: "Not a coach" });
  const availability = await prisma.coachAvailability.create({
    data: { coachId: coach.id, clubId, dayOfWeek, startTime, endTime },
  });
  res.status(201).json(availability);
});

/**
 * @swagger
 * /availability/coach/{coachId}:
 *   get:
 *     summary: List all availabilities for a coach
 *     tags: [Availability]
 *     parameters:
 *       - in: path
 *         name: coachId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: List of availabilities
 */
router.get("/coach/:coachId", async (req, res) => {
  const availabilities = await prisma.coachAvailability.findMany({
    where: { coachId: Number(req.params.coachId) },
  });
  res.json(availabilities);
});

/**
 * @swagger
 * /availability/club/{clubId}:
 *   get:
 *     summary: List all availabilities for a club
 *     tags: [Availability]
 *     parameters:
 *       - in: path
 *         name: clubId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: List of availabilities
 */
router.get("/club/:clubId", async (req, res) => {
  const availabilities = await prisma.coachAvailability.findMany({
    where: { clubId: Number(req.params.clubId) },
  });
  res.json(availabilities);
});

/**
 * @swagger
 * /availability/{id}:
 *   delete:
 *     summary: Delete an availability slot
 *     tags: [Availability]
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
 *         description: Availability deleted
 */
router.delete("/:id", authenticate, async (req, res) => {
  await prisma.coachAvailability.delete({
    where: { id: Number(req.params.id) },
  });
  res.status(204).send();
});

module.exports = router;
