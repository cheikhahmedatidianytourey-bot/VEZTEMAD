# VEZTEMAD

**VEZTEMAD** is WEMAD's planned AI-assisted platform for turning product ideas into software projects, with a roadmap covering code generation, GitHub workflows, quality checks, web deployment, Android APK/AAB builds and Google Play release preparation.

> Technology for a better tomorrow.

## Current status

This repository contains the initial web application foundation:
- Responsive French-language landing page and project workspace.
- Express API with health/configuration endpoints.
- In-memory project creation and listing for early UI validation.
- Basic HTTP security headers, request-size limit, compression and API rate limiting.
- Render Blueprint configuration.

The AI, GitHub, deployment and Android build capabilities are **roadmap items**, not yet active integrations. The current project store is in memory and resets when the server restarts. Do not use this build for production customer data.

## Requirements

- Node.js 20 or newer
- npm

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| GET | `/api/config` | Public capability flags |
| GET | `/api/projects` | List in-memory projects |
| POST | `/api/projects` | Create a project |
| POST | `/api/ai/generate` | Reserved AI generation endpoint (503 until configured) |

## Deployment on Render

1. Create a new Blueprint or Web Service from this repository.
2. Render detects `render.yaml`.
3. Add secrets only in Render's environment settings.
4. Deploy and verify `/api/health`.

## Security

Never commit API keys, OAuth secrets, access tokens, passwords or signing keys. The frontend must never receive private provider credentials. Before public launch, add persistent storage, authentication, authorization, audit logs, billing safeguards, background jobs, integration-specific permission scopes, automated tests and operational monitoring.

## Product direction

See [docs/ROADMAP.md](docs/ROADMAP.md) and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Founder

Founded by Cheikh Ahmed Tidiane Touré.

## License

All rights reserved. Copyright WEMAD.