const express = require("express");
const router = express.Router();
const prisma = require("../models/prisma");
const authenticate = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Coach
 *   description: Coach management
 */

/**
 * @swagger
 * /coach:
 *   get:
 *     summary: List all coaches
 *     tags: [Coach]
 *     responses:
 *       200:
 *         description: List of coaches
 */
router.get("/", async (req, res) => {
  const coaches = await prisma.coach.findMany({
    include: { user: true, clubs: true },
  });
  res.json(coaches);
});

/**
 * @swagger
 * /coach/{id}:
 *   get:
 *     summary: Get coach by ID
 *     tags: [Coach]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Coach details
 */
router.get("/:id", async (req, res) => {
  const coach = await prisma.coach.findUnique({
    where: { id: Number(req.params.id) },
    include: { user: true, clubs: true },
  });
  if (!coach) return res.status(404).json({ error: "Coach not found" });
  res.json(coach);
});

/**
 * @swagger
 * /coach/register:
 *   post:
 *     summary: Register as a coach (authenticated user)
 *     tags: [Coach]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *               resume:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Coach profile created
 */
router.post("/register", authenticate, async (req, res) => {
  const { bio, resume, price } = req.body;
  const coach = await prisma.coach.create({
    data: {
      userId: req.user.userId,
      bio,
      resume,
      price,
    },
  });
  res.status(201).json(coach);
});

/**
 * @swagger
 * /coach/assign:
 *   post:
 *     summary: Assign coach to a club (authenticated coach)
 *     tags: [Coach]
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
 *     responses:
 *       200:
 *         description: Coach assigned to club
 */
router.post("/assign", authenticate, async (req, res) => {
  const { clubId } = req.body;
  const coach = await prisma.coach.update({
    where: { userId: req.user.userId },
    data: {
      clubs: {
        connect: { id: clubId },
      },
    },
    include: { clubs: true },
  });
  res.json(coach);
});

module.exports = router;
