"use strict";

const crypto = require("node:crypto");
const { assertAgentPermission, evaluateAction } = require("./policy");
const { assertSafeSecurityRequest } = require("./security-policy");

const SAFE_ACTIONS = new Set([
  "read_requirements",
  "read_plan",
  "read_workflow",
  "propose_architecture",
  "review_code",
  "review_dependencies",
  "scan_secrets_redacted",
  "write_project_files_in_workspace",
  "run_tests_in_sandbox",
  "recommend_patch",
  "export_branch",
  "create_pull_request"
]);

const SENSITIVE_ACTIONS = new Set([
  "publish_production",
  "deploy_production",
  "purchase_service",
  "release_application",
  "delete_customer_data",
  "change_billing",
  "run_active_security_test"
]);

function cleanLabel(value, max = 80) {
  if (typeof value !== "string") return "unknown";
  return value.replace(/[^a-zA-Z0-9_.:-]/g, "_").slice(0, max) || "unknown";
}

function createSecurityCore({ auditSink, clock = () => Date.now() } = {}) {
  if (auditSink !== undefined && typeof auditSink !== "function") {
    throw new TypeError("auditSink must be a function.");
  }
  if (typeof clock !== "function") throw new TypeError("clock must be a function.");

  const audit = async event => {
    if (auditSink) {
      await auditSink(Object.freeze({
        timestamp: new Date(clock()).toISOString(),
        event_id: crypto.randomUUID(),
        ...event
      }));
    }
  };

  async function authorize({
    agent,
    action,
    permission,
    approved = false,
    approvalReference,
    task,
    securityScope
  } = {}) {
    const agentId = cleanLabel(agent && agent.id);
    const actionName = cleanLabel(action);
    const permissionName = cleanLabel(permission);

    const deny = async (code, reason) => {
      await audit({ decision: "denied", agent: agentId, action: actionName, permission: permissionName, code });
      const error = new Error(reason);
      error.code = code;
      throw error;
    };

    if (!agent || typeof agent.id !== "string") {
      return deny("TITAN_SECURITY_INVALID_AGENT", "TITAN Security Core requires a registered agent.");
    }
    try {
      assertAgentPermission(agent, permission);
    } catch (_error) {
      return deny("TITAN_PERMISSION_DENIED", "TITAN Security Core denied an ungranted permission.");
    }

    if (!SAFE_ACTIONS.has(action) && !SENSITIVE_ACTIONS.has(action)) {
      return deny("TITAN_ACTION_NOT_ALLOWLISTED", "This action is not allowlisted by TITAN Security Core.");
    }

    if (SENSITIVE_ACTIONS.has(action) && permission !== action) {
      return deny("TITAN_SENSITIVE_PERMISSION_REQUIRED", "This agent does not hold the dedicated permission required for this sensitive action.");
    }

    if (typeof task === "string" && task.length > 0) {
      try {
        assertSafeSecurityRequest(task);
      } catch (_error) {
        return deny("TITAN_SECURITY_POLICY_BLOCK", "TITAN Security Core blocked a prohibited request.");
      }
    }

    if (action === "run_active_security_test") {
      const validScope = securityScope &&
        securityScope.authorized === true &&
        typeof securityScope.target === "string" &&
        securityScope.target.length >= 3 &&
        typeof securityScope.ownerOrAuthorizationReference === "string" &&
        securityScope.ownerOrAuthorizationReference.length >= 4 &&
        Array.isArray(securityScope.allowedMethods) &&
        securityScope.allowedMethods.length > 0 &&
        securityScope.stopConditions === true;
      if (!validScope) {
        return deny("TITAN_SECURITY_SCOPE_REQUIRED", "An explicit authorized target, permitted methods, and stop conditions are required.");
      }
    }

    const actionDecision = evaluateAction(action, {
      approved: approved === true && typeof approvalReference === "string" && approvalReference.trim().length >= 6
    });
    if (!actionDecision.allowed) {
      return deny("TITAN_HUMAN_APPROVAL_REQUIRED", "A verifiable human approval reference is required for this sensitive action.");
    }

    await audit({
      decision: "allowed",
      agent: agentId,
      action: actionName,
      permission: permissionName,
      approval_required: SENSITIVE_ACTIONS.has(action)
    });

    return Object.freeze({
      allowed: true,
      agent: agentId,
      action: actionName,
      permission: permissionName,
      approval_required: SENSITIVE_ACTIONS.has(action),
      authorized_at: new Date(clock()).toISOString()
    });
  }

  return Object.freeze({ authorize });
}

module.exports = { createSecurityCore, SAFE_ACTIONS, SENSITIVE_ACTIONS };
