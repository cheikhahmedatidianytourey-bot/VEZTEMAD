const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const db = require("./database");

const COOKIE_NAME = "veztemad_session";
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

function tokenSecret() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    const error = new Error("JWT_SECRET must contain at least 32 characters.");
    error.code = "AUTH_NOT_CONFIGURED";
    throw error;
  }
  return process.env.JWT_SECRET;
}

function sessionTokenHash(jti) {
  return crypto.createHash("sha256").update(jti).digest("hex");
}

function signSessionToken(user, jti) {
  return jwt.sign(
    { sub: user.id, email: user.email, jti },
    tokenSecret(),
    { expiresIn: SESSION_TTL_SECONDS, issuer: "veztemad", audience: "veztemad-web" }
  );
}

function verifyToken(token) {
  return jwt.verify(token, tokenSecret(), { issuer: "veztemad", audience: "veztemad-web" });
}

async function createSession(user) {
  const jti = crypto.randomUUID();
  const token = signSessionToken(user, jti);
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
  await db.query(
    "INSERT INTO auth_sessions (id,user_id,token_hash,expires_at) VALUES ($1,$2,$3,$4)",
    [crypto.randomUUID(), user.id, sessionTokenHash(jti), expiresAt]
  );
  return token;
}

async function revokeSession(jti) {
  if (!jti) return;
  await db.query(
    "UPDATE auth_sessions SET revoked_at=NOW() WHERE token_hash=$1 AND revoked_at IS NULL",
    [sessionTokenHash(jti)]
  );
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS * 1000
  };
}

function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
}

async function hashPassword(password) { return bcrypt.hash(password, 12); }
async function verifyPassword(password, hash) { return bcrypt.compare(password, hash); }

function requireSameOrigin(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();

  const supplied = req.get("origin") || req.get("referer");
  if (!supplied || supplied === "null") {
    return res.status(403).json({ error: "Origine de la requête non vérifiable." });
  }

  let requestOrigin;
  try {
    requestOrigin = new URL(supplied).origin;
  } catch (_error) {
    return res.status(403).json({ error: "Origine de la requête invalide." });
  }

  const configuredOrigins = (process.env.ALLOWED_ORIGIN || "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean)
    .map(value => {
      try { return new URL(value).origin; } catch (_error) { return null; }
    })
    .filter(Boolean);

  const allowedOrigins = configuredOrigins.length
    ? configuredOrigins
    : [`${req.protocol}://${req.get("host")}`];

  if (!allowedOrigins.includes(requestOrigin)) {
    return res.status(403).json({ error: "Requête refusée : origine non autorisée." });
  }
  return next();
}

async function requireAuth(req, res, next) {
  const token = req.cookies && req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "Connectez-vous pour continuer." });

  let payload;
  try {
    payload = verifyToken(token);
    if (!payload.jti || typeof payload.sub !== "string") throw new Error("Invalid session claims");
  } catch (error) {
    if (error.code === "AUTH_NOT_CONFIGURED") return next(error);
    clearSessionCookie(res);
    return res.status(401).json({ error: "Session invalide ou expirée. Veuillez vous reconnecter." });
  }

  try {
    const result = await db.query(
      "SELECT user_id FROM auth_sessions WHERE token_hash=$1 AND user_id=$2 AND revoked_at IS NULL AND expires_at>NOW()",
      [sessionTokenHash(payload.jti), payload.sub]
    );
    if (!result.rows[0]) {
      clearSessionCookie(res);
      return res.status(401).json({ error: "Session révoquée ou expirée. Veuillez vous reconnecter." });
    }
    req.user = { id: payload.sub, email: payload.email };
    req.sessionJti = payload.jti;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  COOKIE_NAME,
  createSession,
  revokeSession,
  sessionCookieOptions,
  clearSessionCookie,
  hashPassword,
  verifyPassword,
  requireSameOrigin,
  requireAuth,
  sessionTokenHash,
  verifyToken
};
