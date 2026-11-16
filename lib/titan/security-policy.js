"use strict";

// TITAN is a defensive engineering system. These rules are mandatory product
// boundaries, not optional prompt suggestions.
const SECURITY_POLICY = Object.freeze({
  version: 1,
  principles: [
    "Protect accounts, identities, data, devices, applications and infrastructure.",
    "Only assess systems the user owns or is explicitly authorized to test.",
    "Never access, take over, bypass, or compromise another person's account.",
    "Never steal, guess, capture, expose, or misuse passwords, tokens, cookies, keys, or sessions.",
    "Never bypass authentication, MFA, access controls, payment controls, or security safeguards.",
    "Never deploy malware, ransomware, spyware, credential stealers, persistence, or destructive payloads.",
    "Never conduct unauthorized intrusion, exploitation, exfiltration, denial of service, or stealth.",
    "Never execute generated code or untrusted repository content inside the VEZTEMAD API process.",
    "Use defensive, isolated, rate-limited testing with explicit scope and stop conditions.",
    "Require explicit human approval for production-impacting actions and sensitive data operations."
  ],
  prohibited: [
    "account_takeover",
    "credential_theft",
    "session_theft",
    "authentication_bypass",
    "mfa_bypass",
    "unauthorized_access",
    "unauthorized_exploitation",
    "data_exfiltration",
    "malware_creation_or_deployment",
    "ransomware",
    "spyware",
    "stealth_or_persistence",
    "destructive_actions",
    "denial_of_service",
    "security_control_evasion"
  ],
  allowedDefensiveWork: [
    "secure_code_review",
    "dependency_vulnerability_review",
    "static_analysis",
    "secret_scanning_without_disclosure",
    "authentication_design_review",
    "authorization_tests_in_owned_test_environments",
    "threat_modeling",
    "patch_recommendations",
    "incident_response_guidance",
    "backup_and_recovery_validation"
  ]
});

const BLOCKED_PATTERNS = Object.freeze([
  /\b(account takeover|take over (an )?account|voler (un )?compte|pirater (un )?compte)\b/i,
  /\b(steal|dump|exfiltrate|harvest)\b.{0,50}\b(credentials?|passwords?|tokens?|cookies?|sessions?)\b/i,
  /\b(bypass|disable|evade)\b.{0,50}\b(authentication|mfa|2fa|access control|security)\b/i,
  /\b(ransomware|credential stealer|keylogger|spyware|botnet)\b/i,
  /\b(unauthorized|without permission|sans autorisation|sans permission)\b.{0,70}\b(access|intrusion|exploit|account|system|compte|système)\b/i,
  /\b(ddos|denial.of.service|persistence|stealth payload)\b/i
]);

function assessSecurityRequest(input) {
  if (typeof input !== "string" || input.trim().length === 0) {
    return { allowed: false, category: "invalid_request", reason: "La demande doit être un texte non vide." };
  }
  if (input.length > 12000) {
    return { allowed: false, category: "request_too_large", reason: "La demande dépasse la limite de sécurité." };
  }
  const match = BLOCKED_PATTERNS.find(pattern => pattern.test(input));
  if (match) {
    return {
      allowed: false,
      category: "prohibited_cyber_activity",
      reason: "TITAN ne peut pas aider à compromettre des comptes, voler des identifiants, contourner des protections ou accéder à un système sans autorisation.",
      safeAlternative: "TITAN peut aider à sécuriser un compte, renforcer l'authentification, auditer un système autorisé ou corriger une vulnérabilité de manière défensive."
    };
  }
  return {
    allowed: true,
    category: "defensive_or_general",
    reason: "Aucune intention interdite évidente n'a été détectée. Les actions sensibles exigent toujours une vérification du périmètre et de l'autorisation."
  };
}

function assertSafeSecurityRequest(input) {
  const decision = assessSecurityRequest(input);
  if (!decision.allowed) {
    const error = new Error(decision.reason);
    error.code = "TITAN_SECURITY_POLICY_BLOCK";
    error.category = decision.category;
    error.safeAlternative = decision.safeAlternative;
    throw error;
  }
  return decision;
}

module.exports = { SECURITY_POLICY, assessSecurityRequest, assertSafeSecurityRequest };
