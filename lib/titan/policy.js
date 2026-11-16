"use strict";

const APPROVAL_REQUIRED_ACTIONS = new Set([
  "publish_production",
  "deploy_production",
  "purchase_service",
  "release_application",
  "delete_customer_data",
  "change_billing"
]);

function evaluateAction(action, context = {}) {
  if (typeof action !== "string" || !/^[a-z][a-z0-9_]{1,63}$/.test(action)) {
    return { allowed: false, requiresApproval: false, reason: "Invalid action identifier." };
  }
  if (APPROVAL_REQUIRED_ACTIONS.has(action)) {
    return {
      allowed: context.approved === true,
      requiresApproval: true,
      reason: context.approved === true ? "Explicit approval supplied." : "Human approval is required before this external or consequential action."
    };
  }
  return { allowed: true, requiresApproval: false, reason: "Action is within the default non-destructive policy." };
}

function assertAgentPermission(agent, permission) {
  if (!agent || !Array.isArray(agent.permissions) || !agent.permissions.includes(permission)) {
    const error = new Error("TITAN policy denied an ungranted agent permission.");
    error.code = "TITAN_PERMISSION_DENIED";
    throw error;
  }
  return true;
}

module.exports = { evaluateAction, assertAgentPermission, APPROVAL_REQUIRED_ACTIONS };
