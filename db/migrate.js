import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDir = path.join(__dirname, "../sql/migrations");

const ensureMigrationsTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

const runMigrations = async () => {
  try {
    await ensureMigrationsTable();

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".up.sql"))
      .sort();

    for (const file of files) {
      const alreadyApplied = await pool.query(
        `SELECT 1 FROM schema_migrations WHERE filename = $1`,
        [file]
      );

      if (alreadyApplied.rows.length > 0) {
        console.log(`Skipping already applied migration: ${file}`);
        continue;
      }

      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf-8");

      console.log(`Applying migration: ${file}`);
      await pool.query("BEGIN");
      await pool.query(sql);
      await pool.query(
        `INSERT INTO schema_migrations (filename) VALUES ($1)`,
        [file]
      );
      await pool.query("COMMIT");

      console.log(`Applied: ${file}`);
    }

    console.log("All migrations complete.");
    process.exit(0);
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Migration failed:", error.message);
    process.exit(1);
  }
};

runMigrations();