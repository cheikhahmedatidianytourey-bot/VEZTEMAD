# VEZTEMAD — Product roadmap

This roadmap distinguishes the long-term product vision from capabilities that exist in the repository today. A checked item means code has been added; it does not automatically mean the feature is production-certified.

## Phase 1 — secure platform foundation

- [x] Responsive French-language product interface.
- [x] Express API, health endpoint, security headers, rate limiting and request limits.
- [x] PostgreSQL schema for users, projects and AI generation history.
- [x] Database initialization and migration command.
- [x] Account registration and login with bcrypt password hashing.
- [x] Signed HttpOnly session cookies and authenticated project ownership.
- [x] Structured AI product-planning endpoint using an OpenAI-compatible API.\n- [x] First Intelligence Core: two-pass analyst and adversarial architect workflow.\n- [x] Deterministic blueprint compiler with task dependencies, quality warnings and risk register.
- [x] Basic API tests and GitHub Actions CI.
- [ ] Production security review, email verification, password reset, MFA and CSRF hardening.
- [ ] Managed PostgreSQL instance, backups and production deployment verification.

## Phase 2 — complete AI app creation

- [ ] Editable product specification, requirements and acceptance criteria.
- [ ] Provider adapters, model routing, usage limits and per-user AI budgets.
- [ ] Safe source-code generation into isolated workspaces.
- [ ] File tree, code editor, diffs, snapshots and project history.
- [ ] Build/test/fix loop with visible logs and explicit user approval.
- [ ] Secure artifact storage and project export.

## Phase 3 — GitHub engineering workflow

- [ ] GitHub App installation and least-privilege permissions.
- [ ] Repository picker, branch management and synchronization.
- [ ] Commit and pull-request creation with reviewable diffs.
- [ ] Webhook signature verification and sync status.

## Phase 4 — web deployment

- [ ] Render integration with scoped credentials and encrypted secret storage.
- [ ] Preview deployments and production deployment approval.
- [ ] Deployment logs, health checks, rollback and environment management.

## Phase 5 — Android delivery

- [ ] Isolated Android/Gradle build workers and job queue.
- [ ] APK and AAB artifact generation.
- [ ] Secure signing-key vault and signing workflow.
- [ ] Google Play Console integration and release checklist.

## Phase 6 — commercial operations

- [ ] One-week free-trial entitlement rules.
- [ ] Subscription plans, billing provider and verified billing webhooks.
- [ ] Usage metering, quotas, refunds and abuse prevention.
- [ ] Customer support, audit logs, incident response and monitoring.

## Phase 7 — supervised AI operations

Specialized agents may assist engineering, QA, security, documentation, support and operations. They must use scoped permissions, task budgets, audit trails and approval gates. No agent should independently publish releases, spend money, access unrelated customer data or alter production infrastructure without an authorized policy and approval.

## Release standard

A feature is not considered complete until its implementation, automated tests, security checks, operational configuration and user-facing behavior have been verified. The platform must not advertise planned integrations as active capabilities.
