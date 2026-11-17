# VEZTEMAD — self-hosted inference

VEZTEMAD's TITAN provider adapter now supports any OpenAI-compatible chat-completions endpoint. This creates a migration path away from hosted AI APIs without coupling the product to one vendor.

## Configuration

Set these values in the hosting provider's secret/environment settings:

| Variable | Meaning |
| --- | --- |
| `AI_API_URL` | Full chat-completions endpoint |
| `AI_MODEL` | Model identifier accepted by the inference server |
| `AI_AUTH_MODE=bearer` | Send `Authorization: Bearer $AI_API_KEY` |
| `AI_API_KEY` | Secret for authenticated hosted/private inference |
| `AI_AUTH_MODE=none` | Explicitly disable bearer authentication for a protected private endpoint |
| `AI_ALLOW_INSECURE_HTTP=true` | Permit HTTP only when the endpoint is on a trusted private network |

HTTPS is required by default. Do not enable insecure HTTP for a public endpoint. Do not put API keys in source files, prompts, logs, or GitHub commits.

## Deployment patterns

1. **Development:** run Ollama or another compatible inference server on a developer-controlled machine and test with a local adapter configuration.
2. **Private production inference:** host vLLM/Ollama behind a private network gateway with authentication; use HTTPS where available. If the private network requires HTTP, explicitly enable the HTTP override and restrict network access at the infrastructure layer.
3. **Vendor-neutral operation:** keep the same VEZTEMAD adapter and change only the endpoint/model settings when switching inference servers.

## Important limits

- The adapter is compatible with the OpenAI chat-completions request/response shape; it does not itself host, train, or own a model.
- Self-hosting requires compute sized for the chosen model. The current VEZTEMAD Render Free web service is an API host, not a GPU inference server.
- A keyless endpoint is safe only when the endpoint is protected by private networking and infrastructure access controls.
- TITAN roles are software agents orchestrated over the configured inference provider; they are not ten independently trained models.
