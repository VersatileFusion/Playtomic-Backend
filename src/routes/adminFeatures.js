const express = require("express");
const router = express.Router();
const prisma = require("../models/prisma");
const authenticate = require("../middlewares/authMiddleware");
const requireAdmin = require("../middlewares/adminMiddleware");

/**
 * @swagger
 * tags:
 *   name: AdminFeatures
 *   description: Admin advanced features (banners, violations, settings)
 */

// Banner CRUD
/**
 * @swagger
 * /admin-features/banner:
 *   get:
 *     summary: List all banners
 *     tags: [AdminFeatures]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of banners
 */
router.get("/banner", authenticate, requireAdmin, async (req, res) => {
  const banners = await prisma.banner.findMany();
  res.json(banners);
});

/**
 * @swagger
 * /admin-features/banner:
 *   post:
 *     summary: Create a banner
 *     tags: [AdminFeatures]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               image:
 *                 type: string
 *               link:
 *                 type: string
 *     responses:
 *       201:
 *         description: Banner created
 */
router.post("/banner", authenticate, requireAdmin, async (req, res) => {
  const { title, image, link } = req.body;
  const banner = await prisma.banner.create({ data: { title, image, link } });
  res.status(201).json(banner);
});

/**
 * @swagger
 * /admin-features/banner/{id}:
 *   put:
 *     summary: Update a banner
 *     tags: [AdminFeatures]
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
 *               title:
 *                 type: string
 *               image:
 *                 type: string
 *               link:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Banner updated
 */
router.put("/banner/:id", authenticate, requireAdmin, async (req, res) => {
  const { title, image, link, isActive } = req.body;
  const banner = await prisma.banner.update({
    where: { id: Number(req.params.id) },
    data: { title, image, link, isActive },
  });
  res.json(banner);
});

/**
 * @swagger
 * /admin-features/banner/{id}:
 *   delete:
 *     summary: Delete a banner
 *     tags: [AdminFeatures]
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
 *         description: Banner deleted
 */
router.delete("/banner/:id", authenticate, requireAdmin, async (req, res) => {
  await prisma.banner.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
});

// Violation Reports
/**
 * @swagger
 * /admin-features/violation:
 *   get:
 *     summary: List all violation reports
 *     tags: [AdminFeatures]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of violation reports
 */
router.get("/violation", authenticate, requireAdmin, async (req, res) => {
  const reports = await prisma.violationReport.findMany({
    include: { user: true },
  });
  res.json(reports);
});

/**
 * @swagger
 * /admin-features/violation/{id}:
 *   put:
 *     summary: Update violation report status
 *     tags: [AdminFeatures]
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
 *         description: Violation report updated
 */
router.put("/violation/:id", authenticate, requireAdmin, async (req, res) => {
  const { status } = req.body;
  const report = await prisma.violationReport.update({
    where: { id: Number(req.params.id) },
    data: { status },
  });
  res.json(report);
});

// Platform settings (mock)
/**
 * @swagger
 * /admin-features/settings:
 *   get:
 *     summary: Get platform settings (mock)
 *     tags: [AdminFeatures]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform settings
 */
router.get("/settings", authenticate, requireAdmin, (req, res) => {
  res.json({
    sharePercent: 10,
    branding: "Playtomic Clone",
    features: ["wallet", "matchmaking", "gamification"],
  });
});

module.exports = router;
