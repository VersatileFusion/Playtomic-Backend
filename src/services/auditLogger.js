const winston = require("winston");

const auditLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "src/logs/audit.log" })
  ]
});

function logAudit({ userId, action, details }) {
  auditLogger.info({ userId, action, details });
}

module.exports = { logAudit }; 