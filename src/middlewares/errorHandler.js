const winston = require("winston");

function errorHandler(err, req, res, next) {
  winston.error(err.stack || err.message || err);
  if (res.headersSent) return next(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
}

function notFound(req, res, next) {
  res.status(404).json({ error: "Not Found" });
}

module.exports = { errorHandler, notFound };
