# Job Application Hub

Human-in-the-loop MVP for discovering jobs, organizing opportunities, drafting application answers, assisting with applications, and syncing outcomes to a spreadsheet.

## Stack

- Frontend: Next.js 15 + TypeScript + App Router
- Backend: FastAPI + SQLAlchemy + Pydantic
- Database: Postgres in production, SQLite for local skeleton/dev fallback
- Background work: queue abstraction with an in-memory implementation for MVP and Redis/Celery or Dramatiq later
- Search: Brave Search API
- Browser assistance: Playwright-oriented adapter interface
- Spreadsheet sync: Google Sheets adapter interface

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

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment

Copy:

- [backend/.env.example](/Users/thangtruong/Documents/auto-apply-jobs/backend/.env.example)
- [frontend/.env.local.example](/Users/thangtruong/Documents/auto-apply-jobs/frontend/.env.local.example)

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

## Current Implemented Backend Endpoints

- `GET /api/v1/health`
- `GET /api/v1/profile`
- `PUT /api/v1/profile`
- `GET /api/v1/sources`
- `POST /api/v1/sources`
- `POST /api/v1/sources/discover`
- `GET /api/v1/jobs`
- `GET /api/v1/answers`
- `POST /api/v1/answers`
- `POST /api/v1/answers/draft`
- `GET /api/v1/applications`
- `POST /api/v1/applications`
- `POST /api/v1/sync/spreadsheet`
- `GET /api/v1/runs`

## Future Scope

- Deeper parser coverage for more job boards
- Similar-question retrieval with embeddings
- Multi-step browser application execution
- Automatic follow-up scheduling
- Multi-agent orchestration around research, tailoring, and application prep
