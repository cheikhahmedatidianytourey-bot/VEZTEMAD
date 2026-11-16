# VEZTEMAD TITAN — Engine foundation

**Status:** provider-backed sequential reasoning workflow implemented; code execution and deployment are not implemented.

## Implemented

- Ten specialist role definitions with explicit permission lists.
- Sequential workflow orchestration with a trace of completed stages.
- OpenAI-compatible provider adapter configured through `AI_API_KEY`, optional `AI_API_URL`, and optional `AI_MODEL`.
- Provider-backed runner with distinct French instructions for each specialist role.
- `runTitanWithProvider()` entry point that connects the provider adapter, role runner, and workflow.
- Bounded task/context/output sizes, HTTPS endpoint requirement, request timeout, bounded retries, and sanitized provider errors.
- Human-approval gates for production deployment, publishing, purchases, releases, billing changes, and destructive customer-data actions.
- Automated unit and integration tests using mocked providers; no paid API request is needed to run the test suite.

## How to configure

Set these environment variables on the server (never in browser code or committed files):

- `AI_API_KEY` — required provider credential.
- `AI_API_URL` — optional HTTPS chat-completions endpoint; defaults to the OpenAI-compatible endpoint.
- `AI_MODEL` — optional model name; defaults to `gpt-4o-mini`.

Example usage from server-side code:

```js
const { runTitanWithProvider } = require("./lib/titan");

const result = await runTitanWithProvider({
  task: "Create a secure appointment booking application for clinics."
});
```

The call makes real provider requests and may incur charges. Tests use mocked adapters and do not contact a provider.

## Important limitations

- The ten roles are prompts executed sequentially through one configured provider/model. They are not ten independent models or autonomous computers.
- The workflow produces analysis and recommendations. It does not yet create files in a project workspace, execute generated code, run project tests, connect GitHub on behalf of a customer, or deploy applications.
- A successful workflow status means the configured stages returned outputs; it does not certify that a proposed application works.
- Provider configuration is server-operator controlled. Never allow an end user to choose an arbitrary provider URL.
- Model output and previous-stage output are untrusted data. They must be validated before any future tool or file operation.

## Safety boundary

Generated code must never execute inside the VEZTEMAD API process. A future build runner must use an isolated, resource-limited environment with controlled network access. External and production-impacting actions require explicit human approval and auditable evidence.

## Next engineering increments

1. Validate structured project-file manifests and safe paths.
2. Persist generated project files in a controlled workspace.
3. Build isolated code-generation and test workers.
4. Add verified repair loops and test evidence.
5. Add scoped GitHub export/PR integration and controlled deployment.
