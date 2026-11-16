"use strict";

const { registry, getAgent } = require("./registry");
const { runTitanWorkflow, DEFAULT_STAGES } = require("./orchestrator");
const { createProviderAdapter } = require("./provider-adapter");
const { createTitanProviderRunner, ROLE_INSTRUCTIONS } = require("./provider-runner");
const { evaluateAction, assertAgentPermission } = require("./policy");
const { SECURITY_POLICY, assessSecurityRequest, assertSafeSecurityRequest } = require("./security-policy");
const { createSecurityCore, SAFE_ACTIONS, SENSITIVE_ACTIONS } = require("./security-core");

async function runTitanWithProvider({ task, adapter, stages = DEFAULT_STAGES, temperature = 0.2 } = {}) {
  const providerAdapter = adapter || createProviderAdapter();
  const runAgent = createTitanProviderRunner({ adapter: providerAdapter, temperature });
  const workflow = await runTitanWorkflow({ task, runAgent, stages });
  return {
    ...workflow,
    execution_mode: "configured_provider",
    limitations: workflow.limitations.filter(value => !value.includes("must be configured before agents can perform AI reasoning")).concat([
      "All specialist roles currently use the same configured provider/model with different role instructions.",
      "Model output is advisory and is not proof of correct code, successful tests, or a completed deployment."
    ])
  };
}

module.exports = {
  registry,
  getAgent,
  runTitanWorkflow,
  runTitanWithProvider,
  DEFAULT_STAGES,
  createProviderAdapter,
  createTitanProviderRunner,
  ROLE_INSTRUCTIONS,
  evaluateAction,
  assertAgentPermission,
  SECURITY_POLICY,
  assessSecurityRequest,
  assertSafeSecurityRequest,
  createSecurityCore,
  SAFE_ACTIONS,
  SENSITIVE_ACTIONS
};
