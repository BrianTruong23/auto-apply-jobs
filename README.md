# Job Application Hub

Human-in-the-loop MVP for discovering jobs, organizing opportunities, drafting application answers, assisting with applications, and syncing outcomes to a spreadsheet.

## Stack

- App: Next.js 15 + TypeScript + App Router + Route Handlers
- Storage: Supabase via `@supabase/supabase-js`, with local JSON fallback when Supabase envs are absent
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
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` power the Supabase SDK integration.
- `SUPABASE_SERVICE_ROLE_KEY` is optional but recommended for server-side writes if your RLS policies block the publishable key.
- Supabase Auth email/password should be enabled if you want the built-in `/login` flow to work.

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
- `GET /api/jobs/:id`
- `GET /api/answers`
- `POST /api/answers`
- `POST /api/answers/draft`
- `GET /api/applications`
- `POST /api/applications`
- `PATCH /api/applications/:id`
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
- The unified app now talks to Supabase through the Supabase SDK when Supabase env vars are present.
- The app now supports per-user data isolation through Supabase Auth and a server-side session cookie.
- Writes use table-level CRUD helpers instead of whole-store rewrites.
- SQL bootstrap files live in [lib/server/migrations](/Users/thangtruong/Documents/auto-apply-jobs/lib/server/migrations) and should be run in the Supabase SQL Editor.
- If Supabase env vars are not set, it falls back to the local JSON store in `.data/`.
- The site now includes a job detail page and application tracking UI.

## Testing

Unit tests:

```bash
npm test
```

Manual verification for persistence with Supabase:

1. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` in `.env.local`.
2. If your RLS policies are strict, also set `SUPABASE_SERVICE_ROLE_KEY` for server-side writes.
3. Run the SQL in [sql/001_initial.sql](/Users/thangtruong/Documents/auto-apply-jobs/sql/001_initial.sql) in the Supabase SQL Editor.
4. If you already created tables from an older version of the app, also run:
   - [sql/002_answer_context.sql](/Users/thangtruong/Documents/auto-apply-jobs/sql/002_answer_context.sql)
   - [sql/003_user_scope.sql](/Users/thangtruong/Documents/auto-apply-jobs/sql/003_user_scope.sql)
5. Enable Supabase Auth email/password if you want to use the built-in login page.
6. Create a user account through `/login`.
7. Log in and confirm each account sees its own profile and records only.
8. Run `npm install`.
9. Run `npm run dev`.
10. Open `http://localhost:3000/`.
11. Confirm the health panel shows `Persistence: supabase`.
12. Open `http://localhost:3000/profile` and save a profile change.
13. Refresh the page and confirm the change persists only for that logged-in user.
14. Check Supabase tables such as `profiles`, `job_sources`, `jobs`, `applications`, and `runs`.

Manual verification for Brave Search:

1. Add `BRAVE_SEARCH_API_KEY` in `.env.local`.
2. Run `npm install`.
3. Run `npm run dev`.
4. Confirm the health panel shows `Brave Search: ready`.
5. Open `http://localhost:3000/sources`.
6. Run discovery with a company and role.
7. Confirm the result panel shows returned posting links, not just counts.
8. Open several returned links and verify they land on real job postings or company careers pages.

Manual verification for step 2, job detail and applications:

1. Open `http://localhost:3000/sources`.
2. Run a discovery request to create at least one job.
3. Open `http://localhost:3000/jobs` and click a job title.
4. On the job detail page, create an application record.
5. Open `http://localhost:3000/applications` and confirm the record appears.
6. Return to the job detail page, update the application, and confirm the updated state is reflected after refresh.

Manual verification for LLM draft answers:

1. Add `OPENREUTER_API` or `OPENROUTER_API_KEY` in `.env.local`.
2. Confirm the health panel shows `OpenRouter: ready`.
3. Open `http://localhost:3000/answers`.
4. Submit a question for a company that does not already have a company-scoped saved answer.
5. A reliable test is using the same question with a different company name.
6. Confirm a non-fallback draft returns and the rationale mentions `google/gemini-2.5-flash`.

Manual verification for resume import on the profile page:

1. Open `http://localhost:3000/profile`.
2. Use `Import resume text file`.
3. For `.txt`, `.md`, `.json`, or `.csv` files, confirm the resume text area is populated immediately.
4. Save the profile and refresh.
5. Confirm the `Resume text` card still shows characters loaded.
6. Note that PDF and DOCX selection is accepted by the picker, but automatic text extraction is not implemented yet.

## Future Scope

- Deeper parser coverage for more job boards
- Similar-question retrieval with embeddings
- Multi-step browser application execution
- Automatic follow-up scheduling
- Multi-agent orchestration around research, tailoring, and application prep
