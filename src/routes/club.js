const express = require("express");
const router = express.Router();
const prisma = require("../models/prisma");
const authenticate = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Club
 *   description: Club management
 */

/**
 * @swagger
 * /club:
 *   get:
 *     summary: List all clubs
 *     tags: [Club]
 *     responses:
 *       200:
 *         description: List of clubs
 */
router.get("/", async (req, res) => {
  const clubs = await prisma.club.findMany();
  res.json(clubs);
});

/**
 * @swagger
 * /club/{id}:
 *   get:
 *     summary: Get club by ID
 *     tags: [Club]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Club details
 */
router.get("/:id", async (req, res) => {
  const club = await prisma.club.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!club) return res.status(404).json({ error: "Club not found" });
  res.json(club);
});

/**
 * @swagger
 * /club:
 *   post:
 *     summary: Create a new club (club owner only)
 *     tags: [Club]
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
 *               address:
 *                 type: string
 *               contact:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Club created
 */
router.post("/", authenticate, async (req, res) => {
  const { name, address, contact, image } = req.body;
  const club = await prisma.club.create({
    data: {
      name,
      address,
      contact,
      image,
      ownerId: req.user.userId,
    },
  });
  res.status(201).json(club);
});

module.exports = router;
