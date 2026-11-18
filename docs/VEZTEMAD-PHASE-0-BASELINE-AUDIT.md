# VEZTEMAD — Phase 0 Baseline Audit

**Audit date:** 2026-11-18  
**Repository:** `cheikhahmedatidianytourey-bot/VEZTEMAD`  
**Audited branch:** `main`  
**Audited commit:** `eb8fabf8c2613f9de088e924a45d4e8a765bec70`

## Purpose

Record the verified implementation baseline before changing production architecture. This audit does not certify production readiness and does not authorize deployment, secret changes, database changes, or paid infrastructure.

## Verified repository facts

- The repository contains a Node.js/Express application at the repository root, including `server.js`, `public/`, `lib/`, and Node API tests.
- The Node application serves the French web interface and exposes `/api/health`, `/api/config`, account, project, and AI-planning routes.
- The Node AI endpoint produces a structured application blueprint. The README explicitly says it does not yet generate, execute, test, or deploy a complete source-code project.
- A separate Python/FastAPI application exists under `backend/`. It exposes `/auth/*` and `/engine/*` routes and defines 12 specialist roles in a sequential orchestration pipeline.
- The Python engine currently reports that direct file writes, automatic deployment, and Android builds are disabled.
- The root `render.yaml` currently defines one Python web service with `rootDir: backend`, `uvicorn app.main:app`, and `/health` as its health check.
- The web interface calls the Node-style `/api/*` routes. The Python service does not expose those same routes. The current Blueprint therefore does not deploy the Node web interface/API as the public application.
- The root `.env.example` documents Node environment names (`JWT_SECRET`, `AI_API_KEY`, `AI_API_URL`); the Python backend reads a different set of names (`SECRET_KEY`, `VEZTEMAD_AI_API_KEY`, `VEZTEMAD_AI_BASE_URL`, etc.). These configurations must be reconciled deliberately.
- The Python `/health` endpoint returns a static healthy response; it does not verify database connectivity. The Node `/api/health` endpoint does query PostgreSQL and reports degraded readiness when the database is unavailable.
- The README and master roadmap explicitly identify code generation, isolated execution, verified GitHub operations, deployment orchestration, Android builds, billing, and customer account lifecycle controls as incomplete.

## CI evidence

GitHub Actions run `44149724993` for commit `eb8fabf8c2613f9de088e924a45d4e8a765bec70` completed successfully. Its single `validate` job reports success for JavaScript syntax checks, Node API tests, Python dependency installation, and Python backend tests.

A green CI run confirms only the checks defined in that workflow. It does not prove that the Render deployment, live database, browser UI, AI provider, or end-to-end application-creation workflow is working.

## Architecture decision required before production changes

Do not replace the existing Render service in place: Render service runtime/type changes can require a new service, and production data and URLs must be protected.

The target architecture should be selected and documented before modifying the Blueprint:

1. One public application/API entry point serving the web interface and authenticated user workflows.
2. A clearly defined AI-engine boundary, either consolidated into the public backend or deployed as a separately secured internal service.
3. One authoritative PostgreSQL schema and a versioned migration process; avoid two independent user/account models.
4. Explicit, validated service-to-service authentication if the AI engine is separate.
5. Separate staging and production rollout, health/readiness checks, rollback plan, and evidence-based acceptance tests.

The decision must account for current Render service identity, database identity, available plans, cost, and whether existing users/data must be migrated. No such infrastructure changes are made by this audit.

## Priority findings

| Priority | Finding | Required outcome |
|---|---|---|
| P0 | Render Blueprint deploys Python while the web product is Node-based | Select and implement one coherent public entry point |
| P0 | Node and Python use different auth, schema, and environment conventions | Establish one identity/session contract and one authoritative data model |
| P0 | Python readiness check does not test PostgreSQL | Implement truthful dependency-aware readiness |
| P1 | AI roles are sequential calls to one provider/model | Implement bounded agent orchestration with budgets, persistence, cancellation, and evidence |
| P1 | No isolated generated-code execution pipeline | Build per-job sandboxing before executing untrusted generated code |
| P1 | No verified GitHub/Render delivery workflow | Add least-privilege integrations, preview deployment, approvals, and rollback |
| P1 | No Android APK/AAB build pipeline | Add reproducible Android build workers and artifact verification |
| P1 | Billing and account recovery controls are incomplete | Implement only after security, legal, webhook, and operational controls are ready |

## Change-control rules

- Do not commit directly to `main` for this work.
- Implement changes on feature branches and open pull requests.
- Require CI to pass and review the diff before merge.
- Do not change production environment variables, credentials, database allowlists, database schema/data, service identity, plan, or deployment settings without explicit approval.
- Never claim a capability is complete until implementation, tests, operational configuration, security review, and user-visible behavior have all been verified.
