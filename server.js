import dotenv from "dotenv";
import logger from "./helper/logger.js";
import pool from "./db/db.js";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await pool.query("SELECT 1");
    logger.info("Database connected successfully");

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();