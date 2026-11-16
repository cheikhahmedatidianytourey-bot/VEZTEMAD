const test = require("node:test");
const assert = require("node:assert/strict");
const { registry, getAgent, runTitanWorkflow, evaluateAction } = require("../lib/titan");

test("TITAN exposes ten clearly scoped specialist roles", () => {
  assert.equal(registry.length, 10);
  assert.equal(getAgent("titan-auditor").domain, "independent_review");
  assert.equal(getAgent("unknown-agent"), null);
});

test("TITAN runs stages in order and records an execution trace", async () => {
  const calls = [];
  const result = await runTitanWorkflow({
    task: "Create a secure appointment booking application for small clinics.",
    runAgent: async input => {
      calls.push(input.stage);
      return { reviewed: input.stage };
    }
  });
  assert.deepEqual(calls, ["decompose", "architect", "security_review", "quality_plan", "independent_review"]);
  assert.equal(result.engine, "VEZTEMAD TITAN");
  assert.equal(result.stages.length, 5);
  assert.equal(result.status, "completed");
  assert.ok(result.limitations.some(value => value.includes("independent AI models")));
});

test("TITAN rejects missing executor and invalid task", async () => {
  await assert.rejects(
    runTitanWorkflow({ task: "This task is sufficiently long for validation." }),
    { code: "TITAN_EXECUTOR_NOT_CONFIGURED" }
  );
  await assert.rejects(
    runTitanWorkflow({ task: "short", runAgent: async () => ({}) }),
    { code: "TITAN_INVALID_TASK" }
  );
});

test("TITAN refuses permissions that are not granted to an agent", async () => {
  await assert.rejects(
    runTitanWorkflow({
      task: "Create a secure appointment booking application for small clinics.",
      stages: [{ agent: "titan-coder", permission: "deploy_production", stage: "deploy" }],
      runAgent: async () => ({})
    }),
    { code: "TITAN_PERMISSION_DENIED" }
  );
});

test("production deployment requires explicit approval", () => {
  assert.equal(evaluateAction("deploy_production").allowed, false);
  assert.equal(evaluateAction("deploy_production").requiresApproval, true);
  assert.equal(evaluateAction("deploy_production", { approved: true }).allowed, true);
  assert.equal(evaluateAction("propose_architecture").allowed, true);
});
