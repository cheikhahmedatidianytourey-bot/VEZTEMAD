require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.split(",").map(v => v.trim()) : false }));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use("/api", rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: "draft-7", legacyHeaders: false }));

const projects = new Map();
const safeText = (value, max = 120) => typeof value === "string" ? value.trim().slice(0, max) : "";

app.get("/api/health", (_req, res) => res.json({
  status: "ok",
  service: "VEZTEMAD",
  version: require("./package.json").version,
  environment: NODE_ENV,
  timestamp: new Date().toISOString()
}));

app.get("/api/config", (_req, res) => res.json({
  product: "VEZTEMAD",
  company: "WEMAD",
  tagline: "Build your next idea.",
  capabilities: {
    projectWorkspace: true,
    aiGeneration: Boolean(process.env.AI_API_KEY),
    githubIntegration: Boolean(process.env.GITHUB_TOKEN),
    deployment: Boolean(process.env.RENDER_API_KEY),
    androidBuilds: false
  }
}));

app.get("/api/projects", (_req, res) => {
  res.json({ projects: Array.from(projects.values()).map(({ id, name, description, createdAt, status }) => ({ id, name, description, createdAt, status })) });
});

app.post("/api/projects", (req, res) => {
  const name = safeText(req.body && req.body.name, 80);
  const description = safeText(req.body && req.body.description, 1000);
  if (!name) return res.status(400).json({ error: "Project name is required." });
  const project = {
    id: crypto.randomUUID(),
    name,
    description,
    status: "draft",
    createdAt: new Date().toISOString()
  };
  projects.set(project.id, project);
  return res.status(201).json({ project });
});

app.post("/api/ai/generate", (_req, res) => {
  if (!process.env.AI_API_KEY) {
    return res.status(503).json({
      error: "AI generation is not connected yet.",
      detail: "Add an AI provider API key in the hosting environment. Never put private keys in frontend code or commit them to GitHub."
    });
  }
  return res.status(501).json({ error: "AI provider adapter is not implemented yet. Configure the provider and adapter before enabling generation." });
});

app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));
app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`VEZTEMAD listening on port ${PORT}`);
});