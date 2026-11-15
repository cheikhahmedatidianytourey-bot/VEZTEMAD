# VEZTEMAD — Product roadmap

This roadmap separates the product vision from capabilities already implemented. Dates and delivery estimates should be set only after technical discovery and resourcing.

## Foundation — in progress
- [x] Initial responsive web interface.
- [x] Express service and health endpoint.
- [x] Initial project workspace flow (temporary in-memory storage).
- [x] Render Blueprint baseline.
- [ ] Automated tests and CI pipeline.
- [ ] Persistent database and migrations.
- [ ] Authentication, account recovery and role-based authorization.

## AI application creation
- [ ] Provider-neutral AI adapter and secure key management.
- [ ] Prompt-to-specification workflow with editable requirements.
- [ ] Code generation into isolated workspaces.
- [ ] File tree, code editor, diffs and version snapshots.
- [ ] Build/test/fix loop with clear logs and user approval.

## GitHub workflows
- [ ] GitHub App installation and least-privilege permissions.
- [ ] Repository picker and branch management.
- [ ] Commit and pull-request creation.
- [ ] Webhook verification and sync status.

## Deployment
- [ ] Render integration with scoped credentials.
- [ ] Preview deployments and production deployment approval.
- [ ] Deployment logs, health checks and rollback workflow.

## Android delivery
- [ ] Isolated Android/Gradle build workers.
- [ ] APK and AAB artifact generation.
- [ ] Secure signing-key vault and signing workflow.
- [ ] Google Play Console integration and release checklist.

## Business and operations
- [ ] One-week free-trial entitlement rules.
- [ ] Subscription plans, billing provider and verified webhooks.
- [ ] Usage metering, quotas and abuse prevention.
- [ ] Support, audit logs, incident response and monitoring.

## Autonomous agent operations
Specialized agents may assist engineering, QA, security, documentation, support and operations. They must operate with scoped permissions, task budgets, audit trails and approval gates. No agent should independently publish releases, spend money, access unrelated customer data or alter production infrastructure without an authorized policy and approval.