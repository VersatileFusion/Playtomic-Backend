const prisma = require("../models/prisma");
const jwt = require("jsonwebtoken");
const { generateOTP, verifyOTP } = require("../services/otpService");
const { sendSMS } = require("../services/smsService");
const { logAudit } = require("../services/auditLogger");

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

async function register(req, res) {
  const { phone, role } = req.body;
  if (!phone || !role)
    return res.status(400).json({ error: "Phone and role required" });
  logAudit({ userId: phone, action: "register_attempt", details: { role } });
  // Generate OTP
  const otp = generateOTP(phone);
  // Send OTP via SMS provider (mock or real)
  await sendSMS(phone, `Your OTP code is: ${otp}`);
  return res.json({ message: "OTP sent" });
}

async function verify(req, res) {
  const { phone, otp } = req.body;
  if (!phone || !otp)
    return res.status(400).json({ error: "Phone and OTP required" });
  logAudit({ userId: phone, action: "login_attempt", details: { otp: "***" } });
  if (!verifyOTP(phone, otp))
    return res.status(401).json({ error: "Invalid or expired OTP" });
  // Find or create user
  let user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    user = await prisma.user.create({ data: { phone, role: "player" } });
  }
  // Issue JWT
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "7d",
  });
  return res.json({ token });
}

module.exports = { register, verify };
