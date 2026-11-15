const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const COOKIE_NAME = "veztemad_session";
function tokenSecret() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    const error = new Error("JWT_SECRET must contain at least 32 characters.");
    error.code = "AUTH_NOT_CONFIGURED";
    throw error;
  }
  return process.env.JWT_SECRET;
}
function issueToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, tokenSecret(), { expiresIn: "7d", issuer: "veztemad", audience: "veztemad-web" });
}
function verifyToken(token) {
  return jwt.verify(token, tokenSecret(), { issuer: "veztemad", audience: "veztemad-web" });
}
function sessionCookieOptions() {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 7 * 24 * 60 * 60 * 1000 };
}
async function hashPassword(password) { return bcrypt.hash(password, 12); }
async function verifyPassword(password, hash) { return bcrypt.compare(password, hash); }
function requireAuth(req, res, next) {
  try {
    const token = req.cookies && req.cookies[COOKIE_NAME];
    if (!token) return res.status(401).json({ error: "Connectez-vous pour continuer." });
    const payload = verifyToken(token);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch (_error) {
    res.clearCookie(COOKIE_NAME, { path: "/" });
    return res.status(401).json({ error: "Session invalide ou expirée. Veuillez vous reconnecter." });
  }
}
module.exports = { COOKIE_NAME, issueToken, sessionCookieOptions, hashPassword, verifyPassword, requireAuth };
