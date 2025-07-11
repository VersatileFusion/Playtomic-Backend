const express = require("express");
const router = express.Router();
const prisma = require("../models/prisma");
const authenticate = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Court
 *   description: Court management
 */

/**
 * @swagger
 * /court:
 *   get:
 *     summary: List all courts
 *     tags: [Court]
 *     responses:
 *       200:
 *         description: List of courts
 */
router.get("/", async (req, res) => {
  const courts = await prisma.court.findMany();
  res.json(courts);
});

/**
 * @swagger
 * /court/{id}:
 *   get:
 *     summary: Get court by ID
 *     tags: [Court]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Court details
 */
router.get("/:id", async (req, res) => {
  const court = await prisma.court.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!court) return res.status(404).json({ error: "Court not found" });
  res.json(court);
});

/**
 * @swagger
 * /court:
 *   post:
 *     summary: Create a new court (club owner only)
 *     tags: [Court]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               price:
 *                 type: number
 *               capacity:
 *                 type: integer
 *               clubId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Court created
 */
router.post("/", authenticate, async (req, res) => {
  const { name, type, price, capacity, clubId } = req.body;
  const court = await prisma.court.create({
    data: {
      name,
      type,
      price,
      capacity,
      clubId,
    },
  });
  res.status(201).json(court);
});

module.exports = router;
