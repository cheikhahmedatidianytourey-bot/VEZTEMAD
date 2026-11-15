const test = require("node:test");
const assert = require("node:assert/strict");
const { evaluateBlueprintQuality } = require("../lib/intelligence/quality-gates");

test("quality gate blocks a blueprint missing essential structure", () => {
  const result = evaluateBlueprintQuality({ project: {}, features: [], execution_graph: { tasks: [] } });
  assert.equal(result.status, "blocked");
  assert.ok(result.blockers.length >= 3);
  assert.match(result.statement, /does not prove/i);
});

test("quality gate passes a complete specification", () => {
  const result = evaluateBlueprintQuality({
    project: { summary: "A platform", architecture: "API and web app", target_users: "Creators", security: ["Access control"] },
    features: [{ name: "Projects" }], screens: [{ name: "Dashboard" }],
    data_model: [{ name: "User" }],
    execution_graph: { tasks: [{ title: "Build API", acceptance_criteria: ["API returns expected response"] }] },
    risks: [{ description: "Data exposure" }]
  });
  assert.equal(result.status, "passed");
  assert.equal(result.score, 100);
});

test("quality gate flags missing acceptance criteria and security review", () => {
  const result = evaluateBlueprintQuality({
    project: { summary: "A platform", architecture: "API" },
    features: [{ name: "Projects" }], screens: [{ name: "Home" }],
    data_model: [{ name: "User" }],
    execution_graph: { tasks: [{ title: "Build API", acceptance_criteria: [] }] },
    risks: [{ description: "Data exposure" }]
  });
  assert.equal(result.status, "review_required");
  assert.ok(result.warnings.some(message => message.includes("acceptance criteria")));
  assert.ok(result.warnings.some(message => message.includes("Security")));
});
