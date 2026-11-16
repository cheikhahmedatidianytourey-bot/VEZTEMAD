"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createSecurityCore } = require("../lib/titan/security-core");
const { getAgent } = require("../lib/titan/registry");

test("security core allows only explicitly allowlisted actions and granted permissions", async () => {
  const core = createSecurityCore();
  const agent = getAgent("titan-architect");
  const result = await core.authorize({ agent, action: "propose_architecture", permission: "read_requirements" });
  assert.equal(result.allowed, true);
  await assert.rejects(
    core.authorize({ agent, action: "arbitrary_action", permission: "read_requirements" }),
    { code: "TITAN_ACTION_NOT_ALLOWLISTED" }
  );
});

test("security core denies ungranted permissions and invalid agents", async () => {
  const core = createSecurityCore();
  await assert.rejects(
    core.authorize({ agent: getAgent("titan-architect"), action: "deploy_production", permission: "deploy_production", approved: true, approvalReference: "APPROVAL-123" }),
    { code: "TITAN_PERMISSION_DENIED" }
  );
  await assert.rejects(
    core.authorize({ action: "propose_architecture", permission: "read_requirements" }),
    { code: "TITAN_SECURITY_INVALID_AGENT" }
  );
});

test("sensitive actions require explicit approval and a reference", async () => {
  const core = createSecurityCore();
  const coder = getAgent("titan-coder");
  await assert.rejects(
    core.authorize({ agent: coder, action: "deploy_production", permission: "deploy_production" }),
    { code: "TITAN_PERMISSION_DENIED" }
  );
  await assert.rejects(
    core.authorize({ agent: getAgent("titan-auditor"), action: "delete_customer_data", permission: "read_workflow" }),
    { code: "TITAN_SENSITIVE_PERMISSION_REQUIRED" }
  );
});

test("active security tests require an explicit authorized scope", async () => {
  const core = createSecurityCore();
  const security = getAgent("titan-security");
  await assert.rejects(
    core.authorize({ agent: security, action: "run_active_security_test", permission: "read_plan" }),
    { code: "TITAN_SECURITY_SCOPE_REQUIRED" }
  );
});

test("security core emits audit metadata without task content or secrets", async () => {
  const events = [];
  const core = createSecurityCore({ auditSink: async event => events.push(event), clock: () => 0 });
  await core.authorize({ agent: getAgent("titan-architect"), action: "propose_architecture", permission: "read_requirements", task: "Design a secure appointment application." });
  assert.equal(events.length, 1);
  assert.equal(events[0].decision, "allowed");
  assert.equal(Object.hasOwn(events[0], "task"), false);
  assert.equal(events[0].timestamp, "1970-01-01T00:00:00.000Z");
});
