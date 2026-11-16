const test = require("node:test");
const assert = require("node:assert/strict");
const app = require("../server");
const server = app.listen(0);
const base = "http://127.0.0.1:" + server.address().port;
const sameOriginHeaders = { Origin: base, "Content-Type": "application/json" };

test("health endpoint reports service identity", async () => {
  const response = await fetch(base + "/api/health");
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.service, "VEZTEMAD");
  assert.ok(["ok", "degraded"].includes(body.status));
});

test("private project endpoint rejects anonymous requests", async () => {
  const response = await fetch(base + "/api/projects");
  assert.equal(response.status, 401);
});

test("registration validates password strength before database access", async () => {
  const response = await fetch(base + "/api/auth/register", {
    method: "POST", headers: sameOriginHeaders,
    body: JSON.stringify({ name: "Test", email: "test@example.com", password: "weak" })
  });
  assert.equal(response.status, 400);
});

test("state-changing API requests reject untrusted origins", async () => {
  const response = await fetch(base + "/api/auth/register", {
    method: "POST",
    headers: { Origin: "https://attacker.example", "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Test", email: "test@example.com", password: "weak" })
  });
  assert.equal(response.status, 403);
});

test("state-changing API requests reject missing origin metadata", async () => {
  const response = await fetch(base + "/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Test", email: "test@example.com", password: "weak" })
  });
  assert.equal(response.status, 403);
});

test("AI generation requires an authenticated session", async () => {
  const response = await fetch(base + "/api/ai/generate", {
    method: "POST", headers: sameOriginHeaders,
    body: JSON.stringify({ prompt: "Build a project management app with teams and tasks." })
  });
  assert.equal(response.status, 401);
});

test.after(() => new Promise(resolve => server.close(resolve)));
