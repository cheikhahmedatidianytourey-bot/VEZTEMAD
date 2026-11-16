# TITAN Security Core

The Security Core is the centralized authorization gate for VEZTEMAD's agent actions.

## Current implementation

- Explicit allowlist for non-destructive engineering actions.
- Deny-by-default behavior for unknown action identifiers.
- Per-agent permission validation.
- Human approval gate for production deployment, publishing, purchases, releases, billing changes, customer-data deletion, and active security tests.
- Active security tests require a declared authorized target, authorization reference, allowed methods, and stop conditions.
- Optional audit sink receives decision metadata only; task text, credentials, tokens, and payloads are deliberately excluded.
- Request-level defensive policy is checked before authorization.

## Example

```js
const { createSecurityCore, getAgent } = require("./lib/titan");

const security = createSecurityCore({
  auditSink: async event => {
    // Persist to a protected append-only audit store in production.
    console.info(event);
  }
});

const decision = await security.authorize({
  agent: getAgent("titan-architect"),
  action: "propose_architecture",
  permission: "read_requirements"
});
```

## Approval model

An approval is not a magic boolean from an untrusted prompt. Sensitive actions require both `approved: true` and a non-empty approval reference. Production integration must validate that reference against a trusted, authenticated human-approval service before allowing the operation. The current module does not itself authenticate approvers or perform external actions.

## Important limitations

- The in-memory module is an authorization decision layer, not an operating-system sandbox.
- Audit events are only persisted if the application supplies a secure audit sink.
- A client must never be allowed to self-assert an approval reference.
- All tools, network clients, filesystem operations, code runners, and deployment adapters must independently enforce this gate.
- Active security testing still requires a human-verified authorization workflow; supplied scope text alone is not proof of ownership.
- No software can promise absolute immunity from hacking. This is one layer in a defense-in-depth design.
