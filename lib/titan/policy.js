"use strict";

const APPROVAL_REQUIRED_ACTIONS = new Set([
  "publish_production",
  "deploy_production",
  "purchase_service",
  "release_application",
  "delete_customer_data",
  "change_billing",
  "run_active_security_test"
]);

const SAFE_ACTIONS = new Set([
  "read_requirements", "read_plan", "read_workflow",
  "propose_architecture", "review_code", "review_dependencies",
  "scan_secrets_redacted", "write_project_files_in_workspace",
  "run_tests_in_sandbox", "recommend_patch", "export_branch",
  "create_pull_request"
]);

function evaluateAction(action, context = {}) {
  if (typeof action !== "string" || !/^[a-z][a-z0-9_]{1,63}$/.test(action)) {
    return { allowed: false, requiresApproval: false, reason: "Invalid action identifier." };
  }
  if (APPROVAL_REQUIRED_ACTIONS.has(action)) {
    const approved = context.approved === true;
    return {
      allowed: approved,
      requiresApproval: true,
      reason: approved ? "Explicit approval supplied." : "Human approval is required before this external or consequential action."
    };
  }
  if (SAFE_ACTIONS.has(action)) {
    return { allowed: true, requiresApproval: false, reason: "Action is explicitly allowlisted." };
  }
  return { allowed: false, requiresApproval: false, reason: "Action is not allowlisted." };
}

function assertAgentPermission(agent, permission) {
  if (!agent || !Array.isArray(agent.permissions) || !agent.permissions.includes(permission)) {
    const error = new Error("TITAN policy denied an ungranted agent permission.");
    error.code = "TITAN_PERMISSION_DENIED";
    throw error;
  }
  return true;
}

module.exports = { evaluateAction, assertAgentPermission, APPROVAL_REQUIRED_ACTIONS, SAFE_ACTIONS };
