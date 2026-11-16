"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { SECURITY_POLICY, assessSecurityRequest, assertSafeSecurityRequest } = require("../lib/titan/security-policy");

test("TITAN security policy explicitly prohibits account compromise and offensive abuse", () => {
  assert.ok(SECURITY_POLICY.prohibited.includes("account_takeover"));
  assert.ok(SECURITY_POLICY.prohibited.includes("credential_theft"));
  assert.ok(SECURITY_POLICY.prohibited.includes("unauthorized_access"));
  assert.ok(SECURITY_POLICY.prohibited.includes("malware_creation_or_deployment"));
});

test("blocks explicit account hacking and credential theft requests", () => {
  for (const request of [
    "Pirater un compte et prendre le contrôle",
    "Steal user passwords and session tokens",
    "Bypass MFA authentication",
    "Deploy ransomware on a server",
    "DDoS a competitor website"
  ]) {
    const decision = assessSecurityRequest(request);
    assert.equal(decision.allowed, false, request);
    assert.equal(decision.category, "prohibited_cyber_activity");
    assert.ok(decision.safeAlternative);
  }
});

test("allows defensive security requests while reminding about authorization", () => {
  for (const request of [
    "Auditer le code de mon application pour trouver des failles",
    "Renforcer la sécurité de mon compte et activer MFA",
    "Créer des tests d'autorisation dans mon environnement de test"
  ]) {
    const decision = assessSecurityRequest(request);
    assert.equal(decision.allowed, true, request);
    assert.match(decision.reason, /autorisation/);
  }
});

test("assertion throws a stable policy error for prohibited requests", () => {
  assert.throws(
    () => assertSafeSecurityRequest("Pirater un compte"),
    error => error.code === "TITAN_SECURITY_POLICY_BLOCK" && Boolean(error.safeAlternative)
  );
});

test("rejects empty and oversized input", () => {
  assert.equal(assessSecurityRequest("").allowed, false);
  assert.equal(assessSecurityRequest("x".repeat(12001)).category, "request_too_large");
});
