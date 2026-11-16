# VEZTEMAD — Security baseline

## Implemented controls

- Passwords are hashed with bcrypt using a work factor of 12.
- Authentication uses signed, seven-day JWTs stored in HttpOnly, SameSite=Lax cookies.
- Each login creates a server-side session record. Only a SHA-256 hash of the session identifier is stored in PostgreSQL.
- Authenticated requests require a matching, unexpired, non-revoked server-side session.
- Logout revokes the server-side session before clearing the browser cookie.
- State-changing API requests require a verifiable same-origin Origin or Referer value. When `ALLOWED_ORIGIN` is configured, it is the explicit origin allowlist.
- Private project queries are scoped to the authenticated user.
- API rate limits, JSON body size limits, security headers and parameterized SQL queries are enabled.

## Secrets and deployment

- Store API keys, OAuth secrets, database credentials and Android signing material only in a managed secret store or hosting environment.
- Never expose private credentials to browser JavaScript.
- Rotate credentials immediately if they are committed or exposed.
- Use separate credentials for development, staging and production.
- Configure `ALLOWED_ORIGIN` with the exact trusted web origin(s) in production.
- Use HTTPS in production so session cookies are marked Secure.

## Remaining work before public launch

- Verify PostgreSQL TLS certificate validation for the actual hosting provider.
- Add account verification, secure password recovery and optional MFA.
- Add automated session cleanup and administrative session management.
- Add persistent audit events for sensitive actions.
- Define and test a restrictive Content Security Policy.
- Add dependency, secret and generated-code scanning.
- Add backups, restore drills, monitoring and incident response.
- Expand integration, authorization, abuse and security regression tests.
- Review CORS, proxy trust and origin configuration against the final production topology.

## AI and generated code

AI output is untrusted. Never execute generated code inside the web process. Run builds in short-lived, isolated workers with restricted network access, CPU/memory/time limits and no access to production secrets.

## Release approvals

Require an authenticated user with the correct project role to approve deployment, app publication, payments, destructive operations and credential changes.

## Current limitations

These controls are an evolving security baseline, not a guarantee of absolute security and not evidence that the platform is production-ready. Security must be tested in a staging environment using the actual PostgreSQL and hosting configuration before public launch.
