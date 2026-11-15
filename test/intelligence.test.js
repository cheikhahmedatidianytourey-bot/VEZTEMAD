const test = require("node:test");
const assert = require("node:assert/strict");
const { compileBlueprint } = require("../lib/intelligence/blueprint");

test("compiler creates stable structured task graph and quality report", () => {
  const input = {
    project_summary: "A booking platform",
    target_users: "Customers and providers",
    architecture: "Web application with API and database",
    features: [{ name: "Bookings", priority: "high" }, "Notifications"],
    screens: ["Home", { name: "Booking", purpose: "Manage bookings" }],
    data_model: [{ name: "User", fields: ["email", { name: "role", type: "text", required: true }] }],
    implementation_steps: ["Define requirements", { title: "Build API", acceptance_criteria: ["API responds"] }],
    risks: [{ description: "Data leakage", severity: "high", mitigation: "Enforce tenant isolation" }]
  };
  const result = compileBlueprint(input, { model: "test-model", reviewPasses: 1 });
  assert.equal(result.blueprint_version, "1.0");
  assert.equal(result.features.length, 2);
  assert.equal(result.execution_graph.tasks.length, 2);
  assert.deepEqual(result.execution_graph.tasks[1].depends_on, ["task-001-define-requirements"]);
  assert.equal(result.quality.completeness, 100);
  assert.equal(result.provenance.engine, "VEZTEMAD Intelligence Core");
});

test("compiler rejects incomplete plans", () => {
  assert.throws(() => compileBlueprint({ project_summary: "Missing architecture" }), /architecture/);
});

test("compiler flags missing user experience and security risks", () => {
  const result = compileBlueprint({
    project_summary: "Simple app", architecture: "Single service",
    features: ["Accounts"], implementation_steps: ["Implement accounts"]
  });
  assert.ok(result.quality.warnings.some(w => w.includes("No screens")));
  assert.ok(result.quality.warnings.some(w => w.includes("No risks")));
});
