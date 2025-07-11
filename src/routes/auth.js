const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { validate, z } = require("../utils/validation");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and onboarding
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user (phone, role, OTP)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [player, coach, club]
 *     responses:
 *       200:
 *         description: OTP sent
 */
const registerSchema = z.object({
  phone: z.string().min(8),
  role: z.enum(["player", "coach", "club"]),
});
router.post("/register", validate(registerSchema), authController.register);

/**
 * @swagger
 * /auth/verify:
 *   post:
 *     summary: Verify OTP and complete registration/login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authenticated (JWT returned)
 */
const verifySchema = z.object({
  phone: z.string().min(8),
  otp: z.string().min(4),
});
router.post("/verify", validate(verifySchema), authController.verify);

module.exports = router;
