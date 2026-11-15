const crypto = require("crypto");

const text = (value, max = 500) => typeof value === "string" ? value.trim().slice(0, max) : "";
const list = value => Array.isArray(value) ? value : [];
const slug = value => text(value, 80).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";

function compileBlueprint(input, meta = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Blueprint input must be an object.");
  const features = list(input.features).map((item, i) => {
    const value = typeof item === "string" ? { name: item } : item || {};
    return { id: "feature-" + String(i + 1).padStart(3, "0"), name: text(value.name || value.title, 120), description: text(value.description, 500), priority: ["critical","high","medium","low"].includes(value.priority) ? value.priority : "medium" };
  }).filter(item => item.name);
  const screens = list(input.screens).map((item, i) => {
    const value = typeof item === "string" ? { name: item } : item || {};
    return { id: "screen-" + String(i + 1).padStart(3, "0"), name: text(value.name || value.title, 100), purpose: text(value.purpose || value.description, 300) };
  }).filter(item => item.name);
  const dataModel = list(input.data_model).map((item, i) => {
    const value = typeof item === "string" ? { name: item } : item || {};
    return { id: "entity-" + String(i + 1).padStart(3, "0"), name: text(value.name || value.entity, 100), fields: list(value.fields).map(field => typeof field === "string" ? text(field, 80) : { name: text(field.name, 80), type: text(field.type, 40), required: Boolean(field.required) }) };
  }).filter(item => item.name);
  const rawSteps = list(input.implementation_steps);
  const tasks = rawSteps.map((item, i) => {
    const value = typeof item === "string" ? { title: item } : item || {};
    const id = "task-" + String(i + 1).padStart(3, "0") + "-" + slug(value.title || value.name).slice(0, 36);
    return { id, title: text(value.title || value.name, 140), description: text(value.description, 600), phase: text(value.phase, 60) || "implementation", priority: ["critical","high","medium","low"].includes(value.priority) ? value.priority : "medium", depends_on: i ? ["task-" + String(i).padStart(3, "0") + "-" + slug((typeof rawSteps[i - 1] === "string" ? rawSteps[i - 1] : rawSteps[i - 1]?.title || rawSteps[i - 1]?.name)).slice(0,36)] : [], acceptance_criteria: list(value.acceptance_criteria).map(v => text(v, 240)).filter(Boolean) };
  }).filter(task => task.title);
  const risks = list(input.risks).map((item, i) => {
    const value = typeof item === "string" ? { description: item } : item || {};
    return { id: "risk-" + String(i + 1).padStart(3, "0"), description: text(value.description || value.title, 300), severity: ["critical","high","medium","low"].includes(value.severity) ? value.severity : "medium", mitigation: text(value.mitigation, 400) };
  }).filter(item => item.description);
  const required = ["project_summary", "architecture"];
  const missing = required.filter(key => !text(input[key], 2000));
  if (missing.length) throw new Error("Blueprint is missing required fields: " + missing.join(", "));
  if (!features.length || !tasks.length) throw new Error("Blueprint must include at least one feature and one implementation task.");
  const featureCoverage = features.length ? Math.min(1, screens.length / features.length) : 0;
  const quality = {
    completeness: Math.round((Number(Boolean(input.project_summary)) + Number(Boolean(input.target_users)) + Number(Boolean(input.architecture)) + Number(features.length > 0) + Number(screens.length > 0) + Number(dataModel.length > 0) + Number(tasks.length > 0) + Number(risks.length > 0)) / 8 * 100),
    feature_count: features.length,
    screen_count: screens.length,
    entity_count: dataModel.length,
    task_count: tasks.length,
    risk_count: risks.length,
    warnings: [
      ...(screens.length === 0 ? ["No screens defined; user experience is underspecified."] : []),
      ...(dataModel.length === 0 ? ["No data entities defined; persistence design needs review."] : []),
      ...(risks.length === 0 ? ["No risks identified; perform a threat and feasibility review."] : []),
      ...(featureCoverage < 0.5 ? ["Screen coverage appears low relative to the number of features."] : [])
    ]
  };
  return {
    blueprint_version: "1.0",
    blueprint_id: crypto.createHash("sha256").update(JSON.stringify({ summary: input.project_summary, features, screens, dataModel, tasks })).digest("hex"),
    created_at: new Date().toISOString(),
    provenance: { engine: "VEZTEMAD Intelligence Core", engine_version: "0.1.0", model: text(meta.model, 80) || "configured-provider", review_passes: Number(meta.reviewPasses) || 0 },
    project: { summary: text(input.project_summary, 2000), target_users: text(input.target_users, 1000), architecture: text(input.architecture, 2000), security: list(input.security).map(v => text(v, 300)).filter(Boolean) },
    features, screens, data_model: dataModel, execution_graph: { tasks, ordering: "dependency-first" }, risks, quality
  };
}

module.exports = { compileBlueprint };
