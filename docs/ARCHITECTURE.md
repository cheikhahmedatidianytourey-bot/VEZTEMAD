# VEZTEMAD — Architecture baseline

## Principles

1. Keep provider credentials on the server, never in browser code.
2. Treat generated code and uploaded project archives as untrusted input.
3. Give every integration the minimum permissions it needs.
4. Require explicit user approval before deployment, publication, billing or destructive actions.
5. Keep durable project data in a database; the current in-memory store is temporary.
6. Isolate build jobs from the web application and from one another.

## Target services

- **Web client:** project dashboard, prompt editor, file explorer, logs and release preparation.
- **API gateway:** authentication, authorization, validation, quotas and audit events.
- **Project service:** project metadata, versions, ownership and permissions.
- **AI orchestration:** provider adapter, prompt templates, agent task planning and human approval gates.
- **Code workspace:** isolated workspaces, generated files, diffs and version control.
- **Quality service:** linting, tests, dependency and secret scanning.
- **GitHub adapter:** OAuth/App installation, repository selection, branch and pull-request workflows.
- **Deployment adapter:** Render service configuration, deploy requests and health verification.
- **Android build workers:** isolated Gradle builds, artifact storage and signing-key management.
- **Billing:** plans, trial entitlement, subscription lifecycle and webhook verification.

## Initial implementation

The first release is intentionally a small Express application. It serves static frontend assets and exposes a limited JSON API. It does not yet contain authentication, a database, an AI provider adapter, GitHub OAuth, deployment automation, Android build infrastructure or payment processing.

## Trust boundaries

- Browser input is untrusted.
- AI output is untrusted until validated and tested.
- Build workers must not have unrestricted access to production secrets.
- Webhooks must be authenticated and replay-protected.
- User projects must be isolated by owner and project permissions.
- Logs must redact credentials and personal data where possible.

## Suggested production topology

Browser → HTTPS edge → API → PostgreSQL / queue → isolated workers → artifact storage.

Provider integrations should be implemented behind narrow server-side adapters with scoped credentials, timeouts, retries and audit records.