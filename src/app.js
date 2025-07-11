require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const winston = require("winston");
const setupSwagger = require("./docs/swagger");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const clubRouter = require("./routes/club");
const courtRouter = require("./routes/court");
const coachRouter = require("./routes/coach");
const bookingRouter = require("./routes/booking");
const paymentRouter = require("./routes/payment");
const notificationRouter = require("./routes/notification");
const adminRouter = require("./routes/admin");
const walletRouter = require("./routes/wallet");
const levelRouter = require("./routes/level");
const analyticsRouter = require("./routes/analytics");
const matchRouter = require("./routes/match");
const availabilityRouter = require("./routes/availability");
const messageRouter = require("./routes/message");
const badgeRouter = require("./routes/badge");
const adminFeaturesRouter = require("./routes/adminFeatures");
const exportRouter = require("./routes/export");
const { errorHandler, notFound } = require("./middlewares/errorHandler");
const {
  authLimiter,
  paymentLimiter,
  apiLimiter,
} = require("./middlewares/rateLimit");

const app = express();

// Logger setup
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "src/logs/app.log" }),
  ],
});

app.use(helmet());
app.use(cors());
app.use(express.json());

// Example request logging middleware
app.use((req, res, next) => {
  logger.info({
    message: "Incoming request",
    method: req.method,
    url: req.url,
    body: req.body,
  });
  next();
});

app.use("/auth", authLimiter, authRouter);
app.use("/user", userRouter);
app.use("/club", clubRouter);
app.use("/court", courtRouter);
app.use("/coach", coachRouter);
app.use("/booking", bookingRouter);
app.use("/payment", paymentLimiter, paymentRouter);
app.use("/notification", notificationRouter);
app.use("/admin", adminRouter);
app.use("/wallet", walletRouter);
app.use("/level", levelRouter);
app.use("/analytics", analyticsRouter);
app.use("/match", matchRouter);
app.use("/availability", availabilityRouter);
app.use("/message", messageRouter);
app.use("/badge", badgeRouter);
app.use("/admin-features", adminFeaturesRouter);
app.use("/export", exportRouter);
app.use(apiLimiter);
app.use(notFound);
app.use(errorHandler);

setupSwagger(app);
logger.info("Swagger docs available at /api-docs");

// Placeholder for routes
app.get("/", (req, res) => {
  res.send("API is running");
});

module.exports = { app, logger };
