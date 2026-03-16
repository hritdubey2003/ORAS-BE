import pg from "pg";
import { configDotenv } from "dotenv";
import logger from "../helper/logger.js";

configDotenv();
const { Pool } = pg;
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.on("connect", () => {
    logger.info("Connected to the database");
});

pool.on("error", (err) => {
  logger.error(`Error connecting to the database: ${err.message}`);
});

export default pool;