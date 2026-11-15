const asArray = value => Array.isArray(value) ? value : [];
const hasText = value => typeof value === "string" && value.trim().length > 0;

function evaluateBlueprintQuality(blueprint) {
  const project = blueprint && blueprint.project || {};
  const features = asArray(blueprint && blueprint.features);
  const screens = asArray(blueprint && blueprint.screens);
  const entities = asArray(blueprint && blueprint.data_model);
  const tasks = asArray(blueprint && blueprint.execution_graph && blueprint.execution_graph.tasks);
  const risks = asArray(blueprint && blueprint.risks);
  const security = asArray(project.security);
  const checks = [];
  const add = (id, passed, severity, message) => checks.push({ id, passed, severity, message });
  add("project-summary", hasText(project.summary), "blocker", "A clear project summary is required.");
  add("architecture", hasText(project.architecture), "blocker", "A target architecture is required.");
  add("target-users", hasText(project.target_users), "warning", "Target users should be identified.");
  add("features", features.length > 0, "blocker", "At least one feature is required.");
  add("screens", screens.length > 0, "warning", "User-facing screens should be specified.");
  add("data-model", entities.length > 0, "warning", "Data entities should be specified or explicitly declared unnecessary.");
  add("implementation-tasks", tasks.length > 0, "blocker", "At least one implementation task is required.");
  add("acceptance-criteria", tasks.length > 0 && tasks.every(task => asArray(task.acceptance_criteria).length > 0), "warning", "Every implementation task should have testable acceptance criteria.");
  add("risk-review", risks.length > 0, "warning", "At least one risk should be assessed, or the absence of risks justified.");
  add("security-review", security.length > 0, "warning", "Security requirements should be documented.");
  const blockers = checks.filter(item => !item.passed && item.severity === "blocker");
  const warnings = checks.filter(item => !item.passed && item.severity === "warning");
  const passedCount = checks.filter(item => item.passed).length;
  return {
    gate_version: "1.0",
    status: blockers.length ? "blocked" : warnings.length ? "review_required" : "passed",
    score: Math.round((passedCount / checks.length) * 100),
    checks,
    blockers: blockers.map(item => item.message),
    warnings: warnings.map(item => item.message),
    statement: "This gate evaluates specification completeness only. It does not prove that software has been implemented, executed, secured, or made error-free."
  };
}

module.exports = { evaluateBlueprintQuality };
