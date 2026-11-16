require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const path = require("path");
const crypto = require("crypto");
const db = require("./lib/database");
const security = require("./lib/security");
const { createIntelligenceBlueprint } = require("./lib/intelligence/orchestrator");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: "draft-7", legacyHeaders: false });
const aiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: "draft-7", legacyHeaders: false, message: { error: "Limite temporaire de génération atteinte. Réessayez plus tard." } });
const safeText = (value, max = 120) => typeof value === "string" ? value.trim().slice(0, max) : "";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.disable("x-powered-by");
if (NODE_ENV === "production") app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.split(",").map(v => v.trim()) : false, credentials: true }));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use("/api", security.requireSameOrigin);
app.use("/api", rateLimit({ windowMs: 60_000, limit: 100, standardHeaders: "draft-7", legacyHeaders: false }));

app.get("/api/health", async (_req, res) => {
  let databaseConnected = false;
  if (db.getPool()) {
    try { await db.query("SELECT 1"); databaseConnected = true; } catch (_error) {}
  }
  res.status(200).json({
    status: databaseConnected ? "ok" : "degraded",
    service: "VEZTEMAD",
    version: require("./package.json").version,
    environment: NODE_ENV,
    dependencies: { database: databaseConnected, aiConfigured: Boolean(process.env.AI_API_KEY) },
    timestamp: new Date().toISOString()
  });
});

app.get("/api/config", (_req, res) => res.json({
  product: "VEZTEMAD", company: "WEMAD", tagline: "Technology for a better tomorrow.",
  capabilities: { accounts: true, persistentProjects: Boolean(process.env.DATABASE_URL), aiGeneration: Boolean(process.env.AI_API_KEY), githubIntegration: Boolean(process.env.GITHUB_TOKEN), deployment: Boolean(process.env.RENDER_API_KEY), androidBuilds: false, payments: false }
}));

app.post("/api/auth/register", authLimiter, async (req, res, next) => {
  try {
    const name = safeText(req.body && req.body.name, 80);
    const email = safeText(req.body && req.body.email, 254).toLowerCase();
    const password = typeof (req.body && req.body.password) === "string" ? req.body.password : "";
    if (name.length < 2) return res.status(400).json({ error: "Le nom doit contenir au moins 2 caractères." });
    if (!emailPattern.test(email)) return res.status(400).json({ error: "Adresse e-mail invalide." });
    if (password.length < 12 || password.length > 128) return res.status(400).json({ error: "Le mot de passe doit contenir entre 12 et 128 caractères." });
    const id = crypto.randomUUID();
    const passwordHash = await security.hashPassword(password);
    const result = await db.query("INSERT INTO users (id,name,email,password_hash) VALUES ($1,$2,$3,$4) RETURNING id,name,email,created_at", [id,name,email,passwordHash]);
    const user = result.rows[0];
    const token = await security.createSession(user);
    res.cookie(security.COOKIE_NAME, token, security.sessionCookieOptions());
    return res.status(201).json({ user });
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ error: "Un compte existe déjà avec cette adresse e-mail." });
    return next(error);
  }
});

app.post("/api/auth/login", authLimiter, async (req, res, next) => {
  try {
    const email = safeText(req.body && req.body.email, 254).toLowerCase();
    const password = typeof (req.body && req.body.password) === "string" ? req.body.password : "";
    const result = await db.query("SELECT id,name,email,password_hash,created_at FROM users WHERE email=$1", [email]);
    const user = result.rows[0];
    if (!user || !(await security.verifyPassword(password, user.password_hash))) return res.status(401).json({ error: "Adresse e-mail ou mot de passe incorrect." });
    const token = await security.createSession(user);
    res.cookie(security.COOKIE_NAME, token, security.sessionCookieOptions());
    return res.json({ user: { id: user.id, name: user.name, email: user.email, created_at: user.created_at } });
  } catch (error) { return next(error); }
});

app.post("/api/auth/logout", security.requireAuth, async (req, res, next) => {
  try {
    await security.revokeSession(req.sessionJti);
    security.clearSessionCookie(res);
    return res.status(200).json({ success: true });
  } catch (error) { return next(error); }
});

app.get("/api/auth/me", security.requireAuth, async (req, res, next) => {
  try {
    const result = await db.query("SELECT id,name,email,created_at FROM users WHERE id=$1", [req.user.id]);
    if (!result.rows[0]) return res.status(401).json({ error: "Compte introuvable." });
    res.json({ user: result.rows[0] });
  } catch (error) { next(error); }
});

app.get("/api/projects", security.requireAuth, async (req, res, next) => {
  try {
    const result = await db.query("SELECT id,name,description,status,created_at AS \"createdAt\",updated_at AS \"updatedAt\" FROM projects WHERE user_id=$1 ORDER BY created_at DESC", [req.user.id]);
    res.json({ projects: result.rows });
  } catch (error) { next(error); }
});

app.post("/api/projects", security.requireAuth, async (req, res, next) => {
  try {
    const name = safeText(req.body && req.body.name, 80);
    const description = safeText(req.body && req.body.description, 2000);
    if (name.length < 2) return res.status(400).json({ error: "Le nom du projet doit contenir au moins 2 caractères." });
    const result = await db.query("INSERT INTO projects (id,user_id,name,description) VALUES ($1,$2,$3,$4) RETURNING id,name,description,status,created_at AS \"createdAt\"", [crypto.randomUUID(),req.user.id,name,description]);
    res.status(201).json({ project: result.rows[0] });
  } catch (error) { res.status(500); next(error); }
});

app.post("/api/ai/generate", aiLimiter, security.requireAuth, async (req, res, next) => {
  try {
    const prompt = safeText(req.body && req.body.prompt, 12000);
    const projectId = safeText(req.body && req.body.projectId, 64);
    if (prompt.length < 20) return res.status(400).json({ error: "Décrivez votre application en au moins 20 caractères." });
    if (projectId) {
      const owned = await db.query("SELECT id FROM projects WHERE id=$1 AND user_id=$2", [projectId,req.user.id]);
      if (!owned.rows[0]) return res.status(404).json({ error: "Projet introuvable." });
    }
    const blueprint = await createIntelligenceBlueprint({ userId: req.user.id, projectId: projectId || null, prompt });
    res.json({ blueprint });
  } catch (error) { return next(error); }
});

app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));
app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.use((error, _req, res, _next) => {
  console.error("API error:", error.message);
  if (error.code === "DATABASE_UNAVAILABLE") return res.status(503).json({ error: error.message });
  if (error.code === "AUTH_NOT_CONFIGURED") return res.status(503).json({ error: "L'authentification n'est pas configurée. Définissez JWT_SECRET." });
  if (error.code === "AI_NOT_CONFIGURED") return res.status(503).json({ error: error.message });
  if (error.code === "AI_PROVIDER_ERROR") return res.status(error.status || 502).json({ error: error.message });
  return res.status(500).json({ error: "Une erreur interne est survenue." });
});

if (require.main === module) {
  (async () => {
    if (process.env.DATABASE_URL) {
      try { await db.migrate(); console.log("Database schema is ready."); }
      catch (error) { console.error("Database migration failed:", error.message); process.exit(1); }
    } else {
      console.warn("DATABASE_URL is missing. Configure PostgreSQL before using accounts or projects.");
    }
    app.listen(PORT, "0.0.0.0", () => console.log("VEZTEMAD listening on port " + PORT));
  })();
}
module.exports = app;
