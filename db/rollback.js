import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDir = path.join(__dirname, "../sql/migrations");

const rollbackLastMigration = async () => {
  try {
    const result = await pool.query(`
      SELECT filename
      FROM schema_migrations
      ORDER BY applied_at DESC, id DESC
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      console.log("No migrations to rollback.");
      process.exit(0);
    }

    const lastMigration = result.rows[0].filename;
    const downFile = lastMigration.replace(".up.sql", ".down.sql");
    const downFilePath = path.join(migrationsDir, downFile);

    if (!fs.existsSync(downFilePath)) {
      throw new Error(`Rollback file not found: ${downFile}`);
    }

    const sql = fs.readFileSync(downFilePath, "utf-8");

    console.log(`Rolling back migration: ${lastMigration}`);
    await pool.query("BEGIN");
    await pool.query(sql);
    await pool.query(
      `DELETE FROM schema_migrations WHERE filename = $1`,
      [lastMigration]
    );
    await pool.query("COMMIT");

    console.log(`Rolled back: ${lastMigration}`);
    process.exit(0);
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Rollback failed:", error.message);
    process.exit(1);
  }
};

rollbackLastMigration();