"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createTitanProviderRunner, ROLE_INSTRUCTIONS } = require("../lib/titan/provider-runner");

const agent = { id: "titan-architect", name: "TITAN ARCHITECT", domain: "architecture" };
const task = "Créer une application sécurisée de prise de rendez-vous pour des cliniques.";

test("provider runner sends role-specific instructions and prior-stage context", async () => {
  let request;
  const runAgent = createTitanProviderRunner({
    adapter: { complete: async input => { request = input; return { content: "Architecture proposée", model: "mock-model", usage: { total_tokens: 20 } }; } }
  });
  const result = await runAgent({ agent, stage: "architect", task, previousOutput: { goals: ["sécurité"] } });
  assert.match(request.messages[0].content, /TITAN ARCHITECT/);
  assert.match(request.messages[0].content, /architecture/);
  assert.match(request.messages[1].content, /sécurité/);
  assert.equal(result.content, "Architecture proposée");
  assert.equal(result.provider_model, "mock-model");
});

test("provider runner has distinct guidance for all registered specialist roles", () => {
  assert.equal(Object.keys(ROLE_INSTRUCTIONS).length, 10);
  assert.match(ROLE_INSTRUCTIONS["titan-security"], /revue défensive/);
  assert.match(ROLE_INSTRUCTIONS["titan-auditor"], /Audite/);
});

test("provider runner rejects missing adapters, unknown roles and oversized context", async () => {
  assert.throws(() => createTitanProviderRunner(), /adaptateur fournisseur/);
  const runAgent = createTitanProviderRunner({ adapter: { complete: async () => ({ content: "ok" }) } });
  await assert.rejects(runAgent({ agent: { id: "unknown", name: "?" }, stage: "x", task }), /aucune instruction/);
  await assert.rejects(runAgent({ agent, stage: "architect", task, previousOutput: "x".repeat(24001) }), /24 000/);
});

test("provider runner rejects empty and oversized model responses", async () => {
  const empty = createTitanProviderRunner({ adapter: { complete: async () => ({ content: " " }) } });
  await assert.rejects(empty({ agent, stage: "architect", task }), /pas fourni/);
  const large = createTitanProviderRunner({ adapter: { complete: async () => ({ content: "x".repeat(30001) }) } });
  await assert.rejects(large({ agent, stage: "architect", task }), /30 000/);
});

test("provider runner validates temperature", () => {
  assert.throws(() => createTitanProviderRunner({ adapter: { complete: async () => ({ content: "ok" }) }, temperature: 3 }), /température/);
});
