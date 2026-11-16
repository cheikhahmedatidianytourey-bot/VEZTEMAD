const test = require("node:test");
const assert = require("node:assert/strict");
delete process.env.DATABASE_URL;
const app = require("../server");
const server = app.listen(0);
const base = "http://127.0.0.1:" + server.address().port;

test("health endpoint reports degraded readiness when PostgreSQL is unavailable", async () => {
  const response = await fetch(base + "/api/health");
  const body = await response.json();
  assert.equal(response.status, 503);
  assert.equal(body.service, "VEZTEMAD");
  assert.equal(body.status, "degraded");
  assert.equal(body.dependencies.database, false);
});

test("public capability flags never advertise unimplemented integrations", async () => {
  const response = await fetch(base + "/api/config");
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.capabilities.githubIntegration, false);
  assert.equal(body.capabilities.deployment, false);
  assert.equal(body.capabilities.androidBuilds, false);
  assert.equal(body.capabilities.payments, false);
});

test("private project endpoint rejects anonymous requests", async () => {
  const response = await fetch(base + "/api/projects");
  assert.equal(response.status, 401);
});

test("registration validates password strength before database access", async () => {
  const response = await fetch(base + "/api/auth/register", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Test", email: "test@example.com", password: "weak" })
  });
  assert.equal(response.status, 400);
});

test("AI generation requires an authenticated session", async () => {
  const response = await fetch(base + "/api/ai/generate", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "Build a project management app with teams and tasks." })
  });
  assert.equal(response.status, 401);
});

test.after(() => new Promise(resolve => server.close(resolve)));
