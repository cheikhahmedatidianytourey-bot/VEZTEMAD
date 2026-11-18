# VEZTEMAD — Phase 1 Target Architecture Decision

**Status:** Proposed; requires founder review before implementation  
**Date:** 2026-11-18  
**Repository baseline:** `main` at `eb8fabf8c2613f9de088e924a45d4e8a765bec70`

## Decision summary

Adopt the Node.js application as the single public product entry point for the next controlled implementation phase. Retain the Python/FastAPI engine as a separately deployed, private worker/API only if its specialist-agent capabilities justify the operational boundary. Do not expose two competing public account systems.

This is a target proposal, not an authorization to change Render, production secrets, databases, DNS, plans, or live deployments.

## Verified blockers

1. The Render Blueprint deploys only `backend/` using Python/FastAPI. The root Node application, which serves `public/index.html` and implements the browser's `/api/*` contract, is not deployed by that Blueprint.
2. Both applications define a SQL table named `users`, but the schemas are incompatible:
   - Node: UUID primary key, `name`, `email`, `password_hash`, timestamps.
   - Python: integer primary key, `email`, `hashed_password`, `is_active`, timestamp.
3. Node's project and generation tables reference the UUID user identity. Python auth and engine use the integer identity. Pointing both services at the same PostgreSQL database does not reconcile these contracts.
4. Python's application lifespan calls SQLAlchemy `Base.metadata.create_all(bind=engine)`. This is not a versioned migration strategy and may create conflicting tables or fail against an existing Node schema.
5. Python defaults to a local SQLite database when `DATABASE_URL` is absent. Its `/health` route currently returns a static healthy response without testing the database.
6. The Python API exposes public-style `/auth/*` and `/engine/*` routes, while the web interface calls Node `/api/*` routes. The two applications do not currently share one session/token contract.

## Proposed target topology

- **Public web application:** Node.js/Express serves the product UI and the sole public `/api/*` contract.
- **Identity and customer data:** One authoritative PostgreSQL schema, with UUID user IDs and versioned migrations. Node owns registration, login, sessions, user profile, projects, billing identity, and customer permissions.
- **Private AI engine:** Python/FastAPI is retained only as an internal service if needed. Remove public customer registration/login from that service; accept only authenticated service-to-service requests from Node, with a scoped identity context and strict request validation.
- **Agent execution:** Long-running generation, tests, builds, and deployments run as isolated jobs/workers, not as unbounded web requests. Generated code is untrusted and must run in disposable, resource-limited sandboxes with no production credentials.
- **Delivery integrations:** GitHub and Render operations use least-privilege credentials, auditable job records, preview environments, explicit approval gates, and rollback support.
- **Android delivery:** APK/AAB builds run in reproducible isolated workers; artifacts are checksummed and retained with build metadata.

## Non-negotiable migration safeguards

- Never point the current Python `create_all` startup at the existing production PostgreSQL database.
- Never rename, drop, or alter the current `users` table in production as an incidental deployment step.
- Inventory and back up existing data; test restore before any migration.
- Design a versioned migration and compatibility window before moving identity or project records.
- Use a staging database and staging services first; verify registration, login, sessions, project ownership, AI job lifecycle, and recovery end to end.
- Keep the current Render service and database intact until the replacement is proven and an approved cutover/rollback plan exists.
- Do not store provider keys in generated project environments or expose them to agents unless a scoped secret broker explicitly authorizes access.

## Implementation sequence

### P0 — Architecture and contract
1. Approve this target topology or amend it.
2. Define API contracts, service authentication, user identity propagation, error model, job state machine, and data ownership.
3. Inventory all existing database tables, indexes, constraints, and records without mutating them.
4. Create a staging environment and isolated staging database.

### P0 — Public application
1. Deploy the Node web application as a separate staging service.
2. Configure staging-only environment variables and database.
3. Verify health/readiness, account lifecycle, projects, rate limits, cookie/session security, and browser flows.
4. Add integration tests against disposable PostgreSQL.

### P0 — Private AI service
1. Remove or disable public customer auth routes in the internal deployment.
2. Add service-to-service authentication, replay/expiry controls, request limits, and scoped user/job context.
3. Replace automatic `create_all` with versioned migrations.
4. Make readiness fail when required dependencies are unavailable.
5. Add timeouts, bounded retries, cancellation, cost budgets, durable job state, and traceable agent outputs.

### P1 — Product delivery
1. Implement real code generation with file manifests and deterministic output validation.
2. Add isolated build/test execution and security scanning.
3. Add GitHub repository/branch/commit/PR workflows with least privilege.
4. Add Render preview deployment and approval-based production release.
5. Add Android build workers and artifact verification.
6. Add billing only after account, audit, webhook, refund, and support controls are ready.

## Acceptance gates

No capability is described as complete until all relevant gates pass:

- Automated unit, integration, contract, and end-to-end tests.
- PostgreSQL migration tested from a realistic prior snapshot and restore verified.
- Security review for authentication, authorization, CSRF/origin, secrets, sandbox escape, dependency and artifact risks.
- Operational monitoring, logs, alerts, backup/restore, rollback, and incident procedures.
- User-visible flow verified in a real browser against staging.
- Evidence attached to the implementation PR and release record.

## Explicitly out of scope for this decision

This document does not merge PRs, change production Render settings, create or alter production databases, change secrets or allowlists, enable paid plans, deploy a replacement, or claim that the full VEZTEMAD platform is already implemented.
