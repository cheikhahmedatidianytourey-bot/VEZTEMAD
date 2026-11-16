"use strict";

const { getAgent } = require("./registry");
const { createSecurityCore } = require("./security-core");
const { assertSafeSecurityRequest } = require("./security-policy");

const securityCore = createSecurityCore();

const DEFAULT_STAGES = Object.freeze([
  { agent: "titan-reasoner", permission: "read_requirements", stage: "decompose" },
  { agent: "titan-architect", permission: "read_requirements", stage: "architect" },
  { agent: "titan-security", permission: "read_plan", stage: "security_review" },
  { agent: "titan-tester", permission: "read_plan", stage: "quality_plan" },
  { agent: "titan-auditor", permission: "read_workflow", stage: "independent_review" }
]);

async function runTitanWorkflow({ task, runAgent, stages = DEFAULT_STAGES }) {
  if (typeof task !== "string" || task.trim().length < 20 || task.length > 12000) {
    const error = new Error("TITAN requires a task between 20 and 12,000 characters.");
    error.code = "TITAN_INVALID_TASK";
    throw error;
  }
  assertSafeSecurityRequest(task);
  if (typeof runAgent !== "function") {
    const error = new Error("A configured agent executor is required. No model provider is assumed.");
    error.code = "TITAN_EXECUTOR_NOT_CONFIGURED";
    throw error;
  }
  if (!Array.isArray(stages) || stages.length < 1 || stages.length > 10) {
    throw new Error("TITAN workflow must contain between 1 and 10 stages.");
  }

  const trace = [];
  let previousOutput = null;
  for (const item of stages) {
    const agent = getAgent(item && item.agent);
    if (!agent || typeof item.stage !== "string" || !/^[a-z][a-z0-9_]{1,39}$/.test(item.stage)) {
      throw new Error("TITAN workflow contains an unknown agent or invalid stage.");
    }
    await securityCore.authorize({
      agent,
      action: item.permission,
      permission: item.permission,
      task: task.trim()
    });
    const output = await runAgent({
      agent: { id: agent.id, name: agent.name, domain: agent.domain, purpose: agent.purpose },
      stage: item.stage,
      task: task.trim(),
      previousOutput
    });
    if (output === undefined || output === null) {
      throw new Error("TITAN agent returned no result at stage: " + item.stage);
    }
    previousOutput = output;
    trace.push({ stage: item.stage, agent: agent.id, status: "completed" });
  }

  return {
    engine: "VEZTEMAD TITAN",
    workflow_version: "0.1.0",
    status: "completed",
    execution_mode: "injected_executor",
    stages: trace,
    result: previousOutput,
    limitations: [
      "The registry defines specialist roles; it does not create independent AI models.",
      "An executor and model provider must be configured before agents can perform AI reasoning.",
      "This workflow does not execute generated code or perform external deployments."
    ]
  };
}

module.exports = { runTitanWorkflow, DEFAULT_STAGES };
