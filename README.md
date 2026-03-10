# Job Application Hub

Human-in-the-loop MVP for discovering jobs, organizing opportunities, drafting application answers, assisting with applications, and syncing outcomes to a spreadsheet.

## Stack

- App: Next.js 15 + TypeScript + App Router + Route Handlers
- Storage: local JSON store fallback today, with Supabase/Postgres envs reserved for the next persistence step
- Background work: queue abstraction with an in-memory implementation for MVP and Redis/Celery or Dramatiq later
- Search: Brave Search API
- LLM: OpenRouter using `google/gemini-2.5-flash`

## Product Definition

Job Application Hub is a central operating system for job applications. It discovers jobs from configured sources, normalizes and deduplicates them, scores fit against a user profile, stores reusable application answers, supports assisted browser-based application workflows, and synchronizes outcomes to a spreadsheet for reporting.

Design principles:

- Reliability over autonomy
- Human control over hidden automation
- Structured data over prompt-only flows
- Reviewable logs over silent actions
- Editability over brittle one-off scripts

## Architecture

See [docs/architecture.md](/Users/thangtruong/Documents/auto-apply-jobs/docs/architecture.md).

## API Design

See [docs/api-design.md](/Users/thangtruong/Documents/auto-apply-jobs/docs/api-design.md).

## Implementation Plan

See [docs/implementation-plan.md](/Users/thangtruong/Documents/auto-apply-jobs/docs/implementation-plan.md).

## Repo Layout

See [docs/repo-structure.md](/Users/thangtruong/Documents/auto-apply-jobs/docs/repo-structure.md).

## Local Development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Environment

Copy:

- [/.env.example](/Users/thangtruong/Documents/auto-apply-jobs/.env.example)

Env notes:

- `BRAVE_SEARCH_API_KEY` powers job discovery.
- `OPENREUTER_API` or `OPENROUTER_API_KEY` powers LLM answers through OpenRouter.
- `OPENROUTER_MODEL` defaults to `google/gemini-2.5-flash`.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` are available for future direct Supabase integration.
- `NEXT_CONNECTION_STRING` is reserved for server-side Postgres/Supabase persistence.

## Single-App API

The repo now runs as one Next.js application. API routes live under [app/api](/Users/thangtruong/Documents/auto-apply-jobs/app/api).

Implemented endpoints:

- `GET /api/health`
- `GET /api/profile`
- `PUT /api/profile`
- `GET /api/sources`
- `POST /api/sources`
- `POST /api/sources/discover`
- `GET /api/jobs`
- `GET /api/answers`
- `POST /api/answers`
- `POST /api/answers/draft`
- `GET /api/applications`
- `POST /api/applications`
- `GET /api/runs`
- `POST /api/sync/spreadsheet`

## MVP Scope

- Profile management
- Job source configuration
- Brave Search job discovery
- Job normalization and deduplication
- Job dashboard with filters
- Job fit scoring with explanations
- LLM draft-answer plug-in points
- Spreadsheet sync plug-in points
- Manual and assisted application tracking
- Audit log and run history

## Current State

- The root of the repo is now the canonical Next.js app.
- Existing `frontend/` and `backend/` folders are legacy scaffolding from the earlier split-app version.
- The new unified app currently persists to a local JSON store in `.data/` so it can run immediately without a separate service.
- `NEXT_CONNECTION_STRING` is the next step if you want me to switch the unified app from file storage to direct Postgres/Supabase persistence.

## Future Scope

- Deeper parser coverage for more job boards
- Similar-question retrieval with embeddings
- Multi-step browser application execution
- Automatic follow-up scheduling
- Multi-agent orchestration around research, tailoring, and application prep
