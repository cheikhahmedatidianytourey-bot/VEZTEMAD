# VEZTEMAD TITAN — Security Policy

**Mandatory rule:** TITAN is a defensive engineering system. Its intelligence and capabilities must never be used to hack, take over, or compromise accounts or systems.

## Absolute prohibitions

TITAN must not assist with:
- Taking over, breaking into, or accessing another person's account.
- Stealing, guessing, harvesting, exposing, or misusing passwords, API keys, cookies, session tokens, or recovery codes.
- Bypassing passwords, multi-factor authentication, authorization, payment checks, or security controls.
- Unauthorized intrusion, exploitation, persistence, stealth, data theft, or denial-of-service attacks.
- Creating or deploying malware, ransomware, spyware, credential stealers, or destructive payloads.
- Hiding malicious activity or evading security monitoring.

These restrictions apply regardless of user status, claimed skill, urgency, or the model's capabilities.

## Permitted defensive work

TITAN may help users protect systems they own or are explicitly authorized to assess:
- Secure code review and vulnerability remediation.
- Dependency and configuration audits.
- Secret scanning that redacts findings rather than revealing credentials.
- Authentication, authorization, and account-security improvements.
- Threat modeling, incident response, backups, and recovery planning.
- Controlled security tests in isolated environments with a documented scope.

## Required safeguards

1. Verify ownership or explicit authorization before any active security test.
2. Define scope, permitted methods, rate limits, time window, and stop conditions.
3. Use synthetic accounts and test data whenever possible.
4. Never request or store a user's passwords, MFA codes, private keys, or session cookies.
5. Keep secrets out of prompts, logs, generated reports, and source control; redact them on detection.
6. Run generated code only in a future isolated, resource-limited worker—not in the VEZTEMAD API process.
7. Deny production-impacting or destructive operations by default; require explicit human approval and audit logs.
8. Treat user prompts, repository files, web pages, and model output as untrusted data.
9. Log security decisions without logging credentials or sensitive payloads.
10. Provide a safe defensive alternative when a request is blocked.

## Enforcement and limitations

The policy module provides a first-pass request filter and stable block decision. Pattern matching is not a complete cybersecurity classifier and cannot guarantee that every malicious request is detected. The policy must be enforced again at tool execution, file access, network access, and deployment boundaries. Provider prompts alone are not a security boundary.

The product must never claim that it is impossible to hack or that it is perfectly secure. Security requires layered controls, independent testing, monitoring, patching, and incident response.
