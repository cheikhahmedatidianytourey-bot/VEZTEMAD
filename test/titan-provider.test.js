"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createProviderAdapter } = require("../lib/titan/provider-adapter");

const messages = [{ role: "user", content: "Design a secure task manager." }];
const ok = (content = "A useful answer") => ({
  ok: true,
  status: 200,
  json: async () => ({ model: "mock-model", choices: [{ message: { content } }], usage: { total_tokens: 12 } })
});

test("adapter sends an authenticated OpenAI-compatible request", async () => {
  let request;
  const adapter = createProviderAdapter({
    apiKey: "test-secret",
    endpoint: "https://provider.example/v1/chat/completions",
    model: "mock-model",
    fetchImpl: async (url, options) => { request = { url, options }; return ok("Blueprint"); },
    maxRetries: 0
  });
  const result = await adapter.complete({ messages, responseFormat: { type: "json_object" } });
  assert.equal(result.content, "Blueprint");
  assert.equal(result.model, "mock-model");
  assert.equal(result.usage.total_tokens, 12);
  assert.equal(request.url, "https://provider.example/v1/chat/completions");
  assert.equal(request.options.headers.Authorization, "Bearer test-secret");
  assert.equal(JSON.parse(request.options.body).response_format.type, "json_object");
});

test("adapter supports keyless self-hosted inference only when explicitly configured", async () => {
  let request;
  const adapter = createProviderAdapter({
    apiKey: "",
    authMode: "none",
    endpoint: "https://inference.wemad.example/v1/chat/completions",
    fetchImpl: async (url, options) => { request = { url, options }; return ok("Local model result"); },
    maxRetries: 0
  });
  const result = await adapter.complete({ messages });
  assert.equal(result.content, "Local model result");
  assert.equal(request.options.headers.Authorization, undefined);
  assert.equal(request.options.headers["Content-Type"], "application/json");
});

test("adapter allows private-network HTTP only with explicit opt-in", async () => {
  assert.throws(
    () => createProviderAdapter({ apiKey: "secret", endpoint: "http://inference.internal/v1/chat/completions" }),
    { code: "AI_INVALID_ENDPOINT" }
  );
  let called = false;
  const allowed = createProviderAdapter({
    authMode: "none",
    endpoint: "http://inference.internal/v1/chat/completions",
    allowInsecureHttp: true,
    fetchImpl: async () => { called = true; return ok(); },
    maxRetries: 0
  });
  await allowed.complete({ messages });
  assert.equal(called, true);
});

test("adapter rejects missing bearer credentials and malformed inputs before network access", async () => {
  const adapter = createProviderAdapter({ apiKey: "", fetchImpl: async () => { throw new Error("must not run"); } });
  await assert.rejects(adapter.complete({ messages }), { code: "AI_NOT_CONFIGURED" });
  const configured = createProviderAdapter({ apiKey: "secret", fetchImpl: async () => ok(), maxRetries: 0 });
  await assert.rejects(configured.complete({ messages: [] }), { code: "AI_INVALID_MESSAGES" });
  await assert.rejects(configured.complete({ messages, temperature: 3 }), { code: "AI_INVALID_TEMPERATURE" });
});

test("adapter rejects malformed endpoint URLs and invalid auth modes", () => {
  assert.throws(() => createProviderAdapter({ endpoint: "not-a-url" }), { code: "AI_INVALID_ENDPOINT" });
  assert.throws(() => createProviderAdapter({ authMode: "basic" }), /AI_AUTH_MODE/);
  assert.throws(() => createProviderAdapter({ endpoint: "https://user:pass@provider.example/api" }), { code: "AI_INVALID_ENDPOINT" });
});

test("adapter retries a rate limit once and then succeeds", async () => {
  let calls = 0;
  const adapter = createProviderAdapter({
    apiKey: "secret",
    fetchImpl: async () => (++calls === 1 ? { ok: false, status: 429 } : ok("Recovered")),
    maxRetries: 1,
    retryDelayMs: 0
  });
  const result = await adapter.complete({ messages });
  assert.equal(calls, 2);
  assert.equal(result.content, "Recovered");
});

test("adapter does not retry permanent client errors or expose response bodies", async () => {
  let calls = 0;
  const adapter = createProviderAdapter({
    apiKey: "secret",
    fetchImpl: async () => { calls += 1; return { ok: false, status: 401, text: async () => "private detail" }; },
    maxRetries: 2,
    retryDelayMs: 0
  });
  await assert.rejects(adapter.complete({ messages }), error => {
    assert.equal(error.code, "AI_PROVIDER_ERROR");
    assert.equal(error.status, 401);
    assert.equal(error.message.includes("private detail"), false);
    return true;
  });
  assert.equal(calls, 1);
});

test("adapter rejects malformed and empty provider responses", async () => {
  const malformed = createProviderAdapter({ apiKey: "secret", fetchImpl: async () => ({ ok: true, json: async () => ({}) }), maxRetries: 0 });
  await assert.rejects(malformed.complete({ messages }), { code: "AI_EMPTY_RESPONSE" });
  const invalidJson = createProviderAdapter({ apiKey: "secret", fetchImpl: async () => ({ ok: true, json: async () => { throw new Error("bad json"); } }), maxRetries: 0 });
  await assert.rejects(invalidJson.complete({ messages }), { code: "AI_INVALID_RESPONSE" });
});

test("adapter bounds retry configuration", () => {
  assert.throws(() => createProviderAdapter({ maxRetries: 4 }), /between 0 and 3/);
  assert.throws(() => createProviderAdapter({ timeoutMs: 0 }), /positive integer/);
});
