# VEZTEMAD — Engineering Architecture and Delivery Plan

**Owner:** WEMAD  
**Founder:** Cheikh Ahmed Tidiane Touré  
**Product:** VEZTEMAD  
**Status:** Engineering plan — proposed capabilities are not implemented until code, tests and deployment evidence exist.

## Product objective

VEZTEMAD is intended to become an AI-assisted software engineering platform that takes a user from a product idea to a verifiable, deployable software project. It must not claim that generated code is correct, secure or production-ready without evidence from execution, tests and review.

## Core product domains

1. **Identity and workspace** — registration, sessions, account recovery, organizations, roles, project ownership and audit history.
2. **Product intelligence** — requirements clarification, assumptions, architecture, data model, API contracts, UX flows and acceptance criteria.
3. **Code generation** — bounded file manifests, template and code generation, project snapshots, version history and reproducible builds.
4. **Execution environment** — isolated, ephemeral build workers; resource, time and network limits; no arbitrary execution inside the web API process.
5. **Quality engineering** — formatting, static analysis, dependency checks, unit/integration tests, build checks, security scans and human-readable evidence.
6. **Repository integration** — least-privilege GitHub App installation, branch creation, commits, pull requests and webhook verification.
7. **Deployment** — explicit environment selection, secret management, preview deployments, health checks, rollback and deployment logs.
8. **Mobile delivery** — Android project generation, isolated APK/AAB builds, signing-key protection and Google Play release preparation.
9. **Agent orchestration** — specialist agents with narrow tools, budgets, task contracts, checkpoints, retries and approval gates.
10. **Billing and operations** — plans, usage metering, payment webhooks, quotas, support workflows, observability and incident response.

## Target architecture

- **Web client:** accessible responsive workspace; project editor, activity timeline, generated artifacts, quality report and deployment status.
- **API layer:** Express application with validated request schemas, authentication, authorization, rate limits and versioned routes.
- **Application services:** identity, projects, generation jobs, integrations, billing and deployment orchestration.
- **PostgreSQL:** durable relational records, migrations, ownership constraints, job state and audit events.
- **Queue and workers:** asynchronous job execution; workers are separate from the public API and operate with short-lived credentials.
- **Object storage:** immutable project artifacts, build logs and exports; never store raw secrets in artifacts.
- **Provider adapters:** model, GitHub, hosting, email, payment and Android build providers behind explicit interfaces.
- **Observability:** structured logs, metrics, traces, error reporting and redaction of credentials and personal data.

## Non-negotiable engineering rules

- Never execute model-generated code in the API process.
- Never expose API keys, signing keys, session secrets or provider tokens to the browser or model prompts.
- Treat prompts, model output, repository content, dependency metadata and webhooks as untrusted input.
- Use least-privilege permissions and short-lived credentials wherever supported.
- Validate every generated path; reject absolute paths, traversal, symlinks and unexpected file types.
- Apply per-user quotas, per-job timeouts, CPU/memory/disk limits and bounded output sizes.
- Require explicit user approval before publishing, spending money, changing production infrastructure or releasing an app.
- Store an immutable record of generated artifacts, tool actions, test results and deployment outcomes.
- A quality score is not proof of correctness. Report exact checks, versions, logs and limitations.
- Do not advertise integrations or capabilities as available until end-to-end tests pass in a real connected environment.

## Delivery sequence

### Stage 0 — Repository baseline
- Preserve the existing Express/PostgreSQL application.
- Inventory every source file, test, workflow and deployment setting.
- Run syntax checks and the complete test suite.
- Record current behavior and known gaps before changing code.

### Stage 1 — Reliable application foundation
- Add schema validation and centralized error handling.
- Add database migrations with version tracking and safe rollback strategy.
- Add CSRF/origin protections, session revocation and account recovery design.
- Add project update/delete operations, pagination and ownership tests.
- Add structured audit events and request correlation IDs.

### Stage 2 — Real code-generation pipeline
- Define a strict, versioned artifact manifest.
- Generate into an isolated workspace with path and size validation.
- Save immutable project versions and diffs.
- Run formatting, static checks, tests and build commands in isolated workers.
- Return artifacts and a transparent quality report; never silently mark failed checks as passed.

### Stage 3 — GitHub integration
- Prefer a GitHub App with repository-scoped installation permissions.
- Support connect, select repository, create branch, commit, pull request and verified webhooks.
- Keep tokens server-side; redact them from logs and error responses.
- Test revoked permissions, missing repositories, rate limits and webhook replay.

### Stage 4 — Deployment orchestration
- Add provider adapters and encrypted secret references.
- Support preview deployment, health verification, logs and rollback.
- Require approval for production deployment.
- Test failed builds, unhealthy services, expired credentials and rollback.

### Stage 5 — Specialist agents
- Define narrow roles: product analyst, architect, frontend, backend, database, QA, security and release.
- Use typed task inputs/outputs, budgets, timeouts and bounded retries.
- Require independent quality gates and approval for consequential actions.
- Keep a full trace of agent decisions and tool invocations.

### Stage 6 — Android and commercial platform
- Build Android projects in isolated workers.
- Protect signing keys and separate build from store publication.
- Add subscription plans, metering, payment webhooks and entitlement checks.
- Complete privacy, legal, security and operational readiness reviews before paid launch.

## Definition of done for each capability

A feature is complete only when:
1. Its API and UI behavior are implemented.
2. Input validation and authorization are tested.
3. Success, failure, timeout and retry paths are tested.
4. Secrets and personal data are protected.
5. Documentation describes configuration and limitations.
6. CI passes.
7. A real staging integration test demonstrates the advertised behavior.

## Current verified baseline (from repository README and source inspection)

The current repository describes a responsive French interface, Express API, PostgreSQL schema, password hashing, signed cookie sessions, private project endpoints, AI-generated structured blueprints, basic quality gates and GitHub Actions validation.

The current AI flow produces a specification/blueprint. It does **not** yet generate, execute, test or deploy a complete application. GitHub repository operations, Render deployment orchestration, Android builds, billing, account recovery, MFA, full audit logging and production-grade end-to-end validation remain future work.

## Competitive differentiation hypothesis

Potential durable advantages to validate:
- A traceable idea-to-release workflow rather than a one-shot code response.
- Independent verification with reproducible build and test evidence.
- Multi-agent collaboration governed by permissions, budgets and quality gates.
- Portable project artifacts and version history that avoid provider lock-in.
- A clear bridge from web applications to Android delivery.
- Transparent reliability reporting instead of unsupported promises of zero errors.

These are strategic hypotheses, not claims of market leadership or technical uniqueness. They must be validated through working prototypes, user research, benchmarks and security review.
