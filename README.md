# VEZTEMAD

**VEZTEMAD** is WEMAD's application creation platform: an evolving workspace for turning product ideas into software through AI-assisted planning, engineering workflows and delivery tools.

> **Technology for a better tomorrow.**

Founded by **Cheikh Ahmed Tidiane Touré**.

## Implemented foundation (0.2.0)

- Responsive French-language product interface.
- Express API with security headers, compression, request limits and rate limiting.
- PostgreSQL schema for users, private projects and AI generation history.
- Account registration and login with bcrypt password hashing.
- Signed seven-day session in an HttpOnly, SameSite=Lax cookie.
- Project endpoints protected by authentication and scoped to the signed-in user.
- OpenAI-compatible application-planning endpoint; it produces a structured product plan, not a complete generated application.
- Startup database schema initialization and a manual migration command.
- Basic automated API tests and GitHub Actions validation.

## Required environment configuration

Set secrets in Render's Environment page. Never commit secrets or paste them into source files.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Random secret, at least 32 characters |
| `AI_API_KEY` | For AI | Provider API key |
| `AI_API_URL` | No | OpenAI-compatible chat completions URL |
| `AI_MODEL` | No | Model name; defaults to `gpt-4o-mini` |
| `ALLOWED_ORIGIN` | If cross-origin | Comma-separated trusted frontend origins |

Generate a strong session secret locally with `openssl rand -base64 48`. Store the result only in Render's secret environment settings.

## Local development

1. Install Node.js 20 or newer and PostgreSQL.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and configure `DATABASE_URL` and `JWT_SECRET`.
4. Run `npm run db:migrate` (the server also ensures the schema exists at startup).
5. Run `npm run dev` and open `http://localhost:3000`.

## API

| Method | Endpoint | Authentication | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | No | Service and dependency health |
| GET | `/api/config` | No | Public capability flags |
| POST | `/api/auth/register` | No | Create an account |
| POST | `/api/auth/login` | No | Start a session |
| POST | `/api/auth/logout` | No | End a session |
| GET | `/api/auth/me` | Yes | Current account |
| GET | `/api/projects` | Yes | List the current user's projects |
| POST | `/api/projects` | Yes | Create a private project |
| POST | `/api/ai/generate` | Yes | Generate a structured application plan |

## Current limitations — not production launch ready

The AI endpoint generates a structured product plan only; it does not yet generate, execute, test or deploy complete source-code projects. GitHub repository creation and commits, Render deployments, background job orchestration, Android APK/AAB builds, Google Play publishing, billing/subscriptions, email verification, password reset, MFA, audit logs and a full admin console remain to be implemented and tested. The repository must not be presented as having those capabilities yet.

Before onboarding paying customers, complete security review, database backups, migrations strategy, email verification and recovery, CSRF/origin protections, abuse controls, integration permission scopes, observability, billing webhooks and end-to-end tests.

## Deployment on Render

Connect this repository as a Render Blueprint, create a managed PostgreSQL database, set `DATABASE_URL` and a strong `JWT_SECRET`, then deploy. Configure the AI key only when ready to enable AI planning. Verify `/api/health` after deployment.

## License

All rights reserved. Copyright WEMAD.
