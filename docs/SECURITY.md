# Security baseline

## Secrets
- Store API keys, OAuth secrets, database credentials and Android signing material only in a managed secret store or hosting environment.
- Never expose private credentials to browser JavaScript.
- Rotate credentials immediately if they are committed or exposed.
- Use separate credentials for development, staging and production.

## Application controls required before public launch
- Authentication and verified account recovery.
- Per-project authorization checks on every read and write.
- Persistent audit events for sensitive actions.
- CSRF protection where cookie-based sessions are used.
- Strict CORS allowlist and production Content Security Policy.
- Request validation, quotas, abuse controls and safe error responses.
- Dependency, secret and generated-code scanning.
- Backups, restore drills, monitoring and incident response.

## AI and generated code
AI output is untrusted. Never execute generated code inside the web process. Run builds in short-lived, isolated workers with restricted network access, CPU/memory/time limits and no access to production secrets.

## Release approvals
Require an authenticated user with the correct project role to approve deployment, app publication, payments, destructive operations and credential changes.

## Current limitations
The starter application has no authentication, persistent database, tenant isolation or production AI integration. Its project list is process memory only. It is a development foundation, not a production-ready SaaS security posture.