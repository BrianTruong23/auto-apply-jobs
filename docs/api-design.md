# API Design

Base path: `/api`

## Auth

- `GET /auth/me`
  - Returns the authenticated Supabase user if a valid session cookie or bearer token is present.
- `POST /auth/session`
  - Mirrors a Supabase access token into a same-origin cookie for server-rendered pages and route handlers.
- `DELETE /auth/session`
  - Clears the server session cookie.

## Profile

- `GET /profile`
  - Returns the authenticated user's profile, preferences, and resume-derived context.
- `PUT /profile`
  - Upserts the authenticated user's profile and preference fields used by scoring and answer generation.
- Future:
  - `POST /profile/resume`

## Sources

- `GET /sources`
  - Lists configured job sources and whether each is enabled.
- `POST /sources`
  - Creates a new configured source.
- `POST /sources/discover`
  - Runs discovery for input keywords, companies, locations, workplace modes, and manual URLs.
- Future:
  - `PATCH /sources/{id}`
  - `POST /sources/{id}/toggle`

## Jobs

- `GET /jobs`
  - Returns normalized jobs with fit score, current status, and explanation.
- Future:
  - `GET /jobs/{id}`
  - `PATCH /jobs/{id}`
  - `POST /jobs/{id}/shortlist`

## Answers

- `GET /answers`
  - Lists reusable answer-bank entries.
- `POST /answers`
  - Creates a reusable answer-bank entry.
- `POST /answers/draft`
  - Returns a suggested answer based on question classification, answer reuse, and later LLM grounding.
- Future:
  - `PATCH /answers/{id}`

## Applications

- `GET /applications`
  - Lists application records and current progress.
- `POST /applications`
  - Creates an application tracking record linked to a job.
- Future:
  - `PATCH /applications/{id}`
  - `POST /applications/{id}/assist`

## Sync

- `POST /sync/spreadsheet`
  - Previews spreadsheet export behavior.
- Future:
  - `POST /sync/spreadsheet/run`
  - `GET /sync/spreadsheet/history`

## Runs

- `GET /runs`
  - Returns discovery, sync, and assisted application run history.

## API Design Principles

- Keep write operations idempotent where possible.
- Return structured explanations, not opaque scores.
- Expose run IDs for every asynchronous or reviewable action.
- Preserve raw payload references for debugging and audit.
- Scope every read and write to the authenticated user.
