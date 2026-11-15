const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

let pool;
function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSL === "disable" ? false : (process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined),
      max: Number(process.env.PG_POOL_MAX || 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });
    pool.on("error", error => console.error("Unexpected PostgreSQL pool error:", error.message));
  }
  return pool;
}
async function migrate() {
  const db = getPool();
  if (!db) throw new Error("DATABASE_URL is not configured.");
  const sql = fs.readFileSync(path.join(__dirname, "..", "db", "schema.sql"), "utf8");
  await db.query(sql);
}
async function query(text, params = []) {
  const db = getPool();
  if (!db) {
    const error = new Error("Database is not configured. Add DATABASE_URL in the hosting environment.");
    error.code = "DATABASE_UNAVAILABLE";
    throw error;
  }
  return db.query(text, params);
}
async function closePool() {
  if (pool) { await pool.end(); pool = null; }
}
module.exports = { getPool, migrate, query, closePool };
