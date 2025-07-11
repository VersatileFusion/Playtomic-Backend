const prisma = require("../models/prisma");

// Simple level calculation: 1 level per 5 bookings, max 7
async function getUserLevel(userId) {
  const bookings = await prisma.booking.count({ where: { userId } });
  const level = Math.min(1 + Math.floor(bookings / 5), 7);
  const progress = Math.min((bookings % 5) / 5, 1);
  return { level, progress };
}

module.exports = { getUserLevel };
