# VEZTEMAD TITAN — Engine foundation

**Status:** foundation implemented; provider-backed autonomous agents are not yet connected.

TITAN is the planned specialist-orchestration layer inside VEZTEMAD. This first increment establishes a real, testable registry, a permission policy, and a sequential workflow contract.

## Implemented in this increment

- Ten specialist role definitions: architect, coder, reasoner, security, tester, repair, optimizer, UI, mobile, and independent auditor.
- Explicit permission lists for each role.
- Sequential workflow execution through an injected executor.
- An execution trace showing which stages completed.
- Human-approval gates for production deployment, publishing, purchases, releases, billing changes, and destructive customer-data actions.
- Automated tests for role registration, workflow order, invalid input, permission denial, and approval requirements.

## Important distinction

The registry contains role definitions, not ten independent AI models. The workflow requires an executor supplied by a future provider integration. Until that adapter is implemented and configured, TITAN does not independently reason, write application code, run tests, or deploy software.

## Safety boundary

Generated code must never execute inside the VEZTEMAD API process. A future build runner must use an isolated, resource-limited environment. External and production-impacting actions require explicit human approval and auditable evidence.

## Next implementation increments

1. Add a provider adapter with timeouts, schema validation, bounded retries, and provider/model configuration.
2. Connect the specialist workflow to the existing AI provider without pretending role prompts are separate models.
3. Add independent artifact validation and test evidence.
4. Build isolated code-generation and execution workers.
5. Add controlled GitHub and deployment integrations.
