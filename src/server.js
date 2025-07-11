const { app, logger } = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
  console.log(`Server running on http://localhost:${PORT}`);
});
