const express = require("express");
const router = express.Router();
const prisma = require("../models/prisma");
const authenticate = require("../middlewares/authMiddleware");
const { validate, z } = require("../utils/validation");

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User profile and onboarding
 */

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */
router.get("/me", authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

/**
 * @swagger
 * /user/me:
 *   put:
 *     summary: Update current user profile
 *     tags: [User]
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
 *               gender:
 *                 type: string
 *               birthdate:
 *                 type: string
 *                 format: date
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated user profile
 */
const updateProfileSchema = z.object({
  name: z.string().optional(),
  gender: z.string().optional(),
  birthdate: z.string().optional(),
  avatar: z.string().optional(),
});
router.put(
  "/me",
  authenticate,
  validate(updateProfileSchema),
  async (req, res) => {
    const { name, gender, birthdate, avatar } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { name, gender, birthdate, avatar },
    });
    res.json(user);
  }
);

module.exports = router;
