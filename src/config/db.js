const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // You can add more config options here if needed
});

pool.on("connect", () => {
  console.log("Connected to PostgreSQL database");
});

module.exports = pool;
