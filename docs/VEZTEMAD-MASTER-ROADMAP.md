# VEZTEMAD — Master Product & Engineering Roadmap

**Company:** WEMAD  
**Product:** VEZTEMAD  
**Founder:** Cheikh Ahmed Tidiane Touré  
**Product ambition:** A dependable AI-assisted software creation and delivery platform.

> This roadmap is the controlling engineering plan. A capability is "complete" only when its implementation, tests, operational configuration, security review, and user-facing behavior have been verified. A roadmap entry or UI label is not proof of implementation.

## 1. Product promise and boundaries

VEZTEMAD should guide a user from an idea to a maintainable software project:

1. Understand the user's goal and ask for missing requirements.
2. Produce a structured specification and architecture.
3. Generate source code into an isolated project workspace.
4. Run automated checks in a restricted sandbox.
5. Diagnose failures and propose or apply bounded repairs.
6. Package a reviewable project and connect it to GitHub.
7. Deploy to a preview environment, then request human approval for production.
8. Prepare web and Android delivery artifacts.
9. Support subscriptions and customer operations only after billing, legal, privacy, and security controls are ready.

The platform must never promise that AI output is error-free, fully secure, or guaranteed to succeed. It must show evidence: files produced, tests run, failures, approvals, deployment result, and known limitations.

## 2. Current verified baseline

| Area | Current state | Honest status |
|---|---|---|
| Web interface | Responsive French interface | Foundation implemented |
| Accounts | Register/login, bcrypt, signed HttpOnly cookie | Basic implementation; hardening remains |
| Projects | Private project records and user-scoped list | Basic implementation |
| AI planning | Analyst + review pass, structured blueprint | Implemented; not code generation |
| Specification quality | Completeness checks and warnings | Implemented; not code correctness |
| TITAN roles | Ten role definitions and sequential orchestration | Foundation; same provider/model |
| Provider adapter | OpenAI-compatible adapter with timeout/retries | Implemented with mocked tests |
| TITAN Security Policy | Defensive-only rules and request filter | First layer; not a guarantee |
| TITAN Security Core | Permission/action gate and audit callback | Foundation; integration hardening remains |
| Code generation | No complete application source generator | Not implemented |
| Code execution | No isolated execution sandbox | Not implemented |
| GitHub operations | No verified repository creation/push workflow | Not implemented |
| Deployment | No verified deployment orchestrator | Not implemented |
| Android | No APK/AAB build pipeline | Not implemented |
| Billing | No subscription/payment system | Not implemented |
| Customer lifecycle | Email verification, password reset, MFA incomplete | Not production ready |

## 3. Architecture principles — mandatory

- **Deny by default:** unknown actions, tools, destinations, and permissions are rejected.
- **Least privilege:** each agent and job receives only the minimum capability it needs.
- **Isolation:** generated code and untrusted repository content never execute inside the web API process.
- **Tenant separation:** every project, file, job, log, artifact, and secret is scoped to its owner/workspace.
- **Secrets protection:** credentials are stored in a secret manager/environment, never placed in prompts, source files, logs, or generated artifacts.
- **Human approval:** production deployment, publication, purchases, billing changes, destructive operations, and customer-data deletion require authenticated human approval.
- **Evidence over claims:** record the exact commit, build, tests, scan results, and deployment state.
- **Reproducibility:** pin runtime/tool versions and dependencies; record build inputs.
- **Cost controls:** per-user quotas, timeouts, concurrency limits, token budgets, and cancellation.
- **Safe failure:** failed or timed-out jobs stop cleanly, preserve diagnostic evidence, and do not silently publish partial results.
- **Privacy by design:** collect only necessary data, define retention and deletion, and avoid exposing customer prompts or source code.
- **No offensive cyber capability:** no account compromise, credential theft, unauthorized access, malware, stealth, persistence, or destructive actions.

## 4. Delivery phases and acceptance criteria

### Phase 0 — Baseline integrity and product contract
- Keep README, UI capability flags, API behavior, and this roadmap aligned.
- Confirm all current CI tests pass on the latest commit.
- Remove or label any UI claims that imply unavailable features.
- Define versioning, error conventions, logging policy, and database migration policy.

**Exit gate:** clean CI; current feature inventory; no false capability claims.

### Phase 1 — Production-grade account and data foundation
- Email verification and secure password reset.
- Session rotation/revocation and logout-all-devices.
- CSRF/origin protections appropriate to cookie authentication.
- Login abuse detection, rate limits, generic authentication errors.
- User/workspace ownership checks for every data endpoint.
- Database constraints, indexed queries, migration history, backups and restore drills.
- Data export/deletion workflow and retention policy.
- Security headers and dependency scanning.

**Exit gate:** automated authentication/authorization tests, cross-user isolation tests, migration and backup recovery evidence, independent security review.

### Phase 2 — TITAN Security Core and execution safety
- Finish centralized authorization and reconcile agent permissions with action allowlists.
- Validate all tool invocations at the execution boundary, not only in prompts.
- Treat prompts, model output, uploaded files, repository contents, and tool results as untrusted.
- Add structured approval records bound to actor, action, target, scope, expiry, and one-time use.
- Add immutable/append-only audit storage with redaction.
- Add per-user and per-job quotas, cancellation, timeouts, and safe cleanup.
- Build isolated job workers and sandbox profiles with no default network access.
- Add controlled outbound network policy only for explicit allowlisted needs.
- Prevent host filesystem access, privilege escalation, cross-tenant reads, and secret exposure.

**Exit gate:** adversarial tests show blocked cross-tenant access, prohibited actions, network escape attempts, secret leakage, and unapproved side effects; sandbox escape review by a qualified security reviewer.

### Phase 3 — Real application code generation
- Convert approved blueprint into a typed implementation plan.
- Build a deterministic file manifest and safe path validator.
- Generate a minimal runnable project from approved templates first.
- Support an initial, deliberately narrow stack (for example Node.js + Express + HTML/CSS/JS) before expanding.
- Write files only into a per-job workspace.
- Validate file count, file size, paths, dependencies, and package scripts.
- Track generated files, model/provider, prompt version, and source blueprint.
- Add preview of changed files and explicit user approval before committing/exporting.

**Exit gate:** benchmark set of representative user requests generates reproducible projects that install and pass tests in the sandbox; failures are visible and recoverable.

### Phase 4 — Build, test, repair, and quality evidence
- Run install/build/test/lint/type checks in sandbox workers.
- Capture structured stdout/stderr, exit code, duration, resource use, and artifact hashes.
- Create independent test plans from acceptance criteria.
- Add static analysis, dependency vulnerability checks, secret scanning, and software bill of materials.
- Let TITAN REPAIR propose bounded patches against a failing test.
- Re-run the full affected test suite after every repair.
- Cap repair loops and cost; require user approval for broad or destructive changes.
- Distinguish specification quality, code quality, test coverage, and security findings.

**Exit gate:** test evidence tied to exact source revision; no "passed" status without actually running the relevant checks.

### Phase 5 — GitHub integration
- OAuth/GitHub App authorization with minimum repository permissions.
- Explicit repository selection and ownership verification.
- Create repository or branch only after user confirmation.
- Commit generated code with clear messages and provenance.
- Pull request workflow, diff preview, status checks, and rollback guidance.
- Webhook signature verification, replay protection, idempotency, and scoped installation tokens.
- Never request or store a user's personal GitHub password or broad personal access token when a narrower integration is possible.

**Exit gate:** integration tests against a dedicated test repository; verified least privilege, webhook authenticity, and tenant isolation.

### Phase 6 — Preview and production deployment
- Provider-neutral deployment adapter, beginning with one provider.
- Store provider credentials securely and per workspace.
- Preview deployments first; no automatic production release.
- Validate build artifact, environment variables, domain, and health endpoint.
- Human approval bound to exact artifact/commit and target environment.
- Deployment logs, status polling, rollback, and cost limits.
- Prevent arbitrary deployment URLs or untrusted webhook commands.

**Exit gate:** repeatable preview deployment and rollback demonstrated in a test environment; production requires explicit approval.

### Phase 7 — Android delivery
- Start with a supported web-to-mobile/PWA strategy or one native framework; do not claim universal Android support.
- Build APK/AAB in isolated, version-pinned workers.
- Protect signing keys in managed secret storage; signing requires owner-controlled approval.
- Run package, permission, malware, and dependency checks.
- Produce artifact hashes, version metadata, and install instructions.
- Prepare Play Console metadata and release checklist; publishing remains a human-approved action.

**Exit gate:** reproducible APK/AAB build, signed test artifact, install test, and release evidence.

### Phase 8 — Commercial platform and customer operations
- Pricing and quotas based on measured provider/build costs.
- Payment provider integration with signed webhook verification and idempotency.
- Subscription lifecycle, invoices, cancellations, refunds, failed-payment handling.
- Free trial limits and abuse protection.
- Customer support, privacy policy, terms, data processing and retention.
- Admin console with strict role-based access and audited support actions.
- Usage analytics that avoid unnecessary collection of source code or sensitive prompts.

**Exit gate:** end-to-end test payments in sandbox mode, reconciliation, refund/cancellation tests, legal review, and cost-positive unit economics.

### Phase 9 — Reliability, scale, and continuous improvement
- Queue-based job orchestration, retries, dead-letter handling, and idempotency.
- Metrics, traces, alerts, incident response, status page, and on-call runbooks.
- Load tests, database capacity, cache strategy, and disaster recovery.
- Model/provider benchmarking, routing by task and budget, evaluation datasets.
- Reusable templates/components and validated engineering memory.
- Feedback loop based on measured success, defects, cost, and user satisfaction.
- Multi-provider failover only after quality and privacy comparisons.

**Exit gate:** documented service objectives, load-test evidence, restore exercise, incident drill, and transparent reliability metrics.

## 5. TITAN operating model

TITAN roles are specialized responsibilities, not ten independent models by default:

1. TITAN REASONER — clarify goals, assumptions, and constraints.
2. TITAN ARCHITECT — design system structure and implementation sequence.
3. TITAN SECURITY — threat model and defensive review.
4. TITAN UI — interface and accessibility plan.
5. TITAN CODER — generate bounded changes in the workspace.
6. TITAN TESTER — define and execute acceptance checks.
7. TITAN REPAIR — propose bounded corrections.
8. TITAN OPTIMIZER — measure and improve performance/cost.
9. TITAN MOBILE — mobile packaging and platform constraints.
10. TITAN AUDITOR — challenge claims and require evidence.

Each stage receives only its approved context and permissions. Agent output is untrusted until validated. The system must never let an agent grant itself permissions or approve its own sensitive actions.

## 6. Initial technology strategy

Use the current Node.js/Express/PostgreSQL foundation until evidence justifies a change. Add a job queue and isolated workers as separate components. Start with one supported code-generation stack and one deployment target. Avoid expensive multi-model calls, GPU infrastructure, or broad provider integrations before the product demonstrates reliable demand.

## 7. Product metrics

Track at minimum:
- Idea-to-runnable-project success rate.
- Build and test pass rate on first attempt and after repair.
- Defects escaping validation.
- Median generation time and cost per successful project.
- Sandbox failures and security policy denials.
- Deployment success and rollback rate.
- User retention, support burden, and refund rate.
- Percentage of outputs with reproducible evidence.

Do not optimize for impressive demos alone; optimize for successful, maintainable projects at a sustainable cost.

## 8. Immediate execution order

1. Verify current CI and repair any failing test before adding features.
2. Reconcile TITAN permission identifiers with the Security Core allowlist and add orchestration regression tests.
3. Complete Phase 2's security execution boundaries and isolated worker design.
4. Harden account/session/tenant protections (Phase 1) before real customer onboarding.
5. Implement a narrow, testable code-generation vertical slice (Phase 3).
6. Add sandbox build/test/repair (Phase 4).
7. Integrate GitHub, preview deployment, Android, and billing only after their prerequisites pass.

## 9. Definition of "finished"

VEZTEMAD is not finished merely because all roadmap documents exist. The platform is ready for a public paid launch only when:
- All launch-critical acceptance gates pass.
- Security review and recovery exercises are documented.
- Real user journeys pass end-to-end tests.
- Billing and operational costs are understood.
- Privacy/legal documents and support processes are ready.
- The live service matches the capabilities shown in the interface and marketing.

**Strategic principle:** build a smaller reliable product first, then expand. Excellence comes from verifiable execution, security, and user value—not from the number of agents or the size of the promises.
