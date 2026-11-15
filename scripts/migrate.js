require("dotenv").config();
const db = require("../lib/database");
(async () => {
  try {
    await db.migrate();
    console.log("VEZTEMAD database schema migrated successfully.");
  } catch (error) {
    console.error("Database migration failed:", error.message);
    process.exitCode = 1;
  } finally {
    await db.closePool();
  }
})();
