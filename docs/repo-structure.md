# Recommended Repo Structure

```text
job-application-hub/
├── README.md
├── docs/
│   ├── architecture.md
│   ├── api-design.md
│   ├── implementation-plan.md
│   └── repo-structure.md
├── shared/
│   └── contracts.ts
├── backend/
│   ├── .env.example
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── router.py
│   │   │   └── routes/
│   │   │       ├── health.py
│   │   │       ├── profile.py
│   │   │       ├── sources.py
│   │   │       ├── jobs.py
│   │   │       ├── answers.py
│   │   │       ├── applications.py
│   │   │       ├── sync.py
│   │   │       └── runs.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── logging.py
│   │   ├── db/
│   │   │   ├── base.py
│   │   │   └── session.py
│   │   ├── models/
│   │   │   ├── profile.py
│   │   │   ├── job_source.py
│   │   │   ├── job.py
│   │   │   ├── application.py
│   │   │   ├── answer_bank.py
│   │   │   └── run_log.py
│   │   ├── repositories/
│   │   │   ├── jobs.py
│   │   │   └── sources.py
│   │   ├── schemas/
│   │   │   ├── common.py
│   │   │   ├── profile.py
│   │   │   ├── source.py
│   │   │   ├── job.py
│   │   │   ├── answer.py
│   │   │   ├── application.py
│   │   │   └── run.py
│   │   ├── services/
│   │   │   ├── discovery.py
│   │   │   ├── parsing.py
│   │   │   ├── scoring.py
│   │   │   ├── answers.py
│   │   │   ├── automation.py
│   │   │   ├── spreadsheet_sync.py
│   │   │   └── audit.py
│   │   └── workers/
│   │       └── tasks.py
│   └── tests/
├── frontend/
│   ├── .env.local.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── profile/page.tsx
│   │   ├── jobs/page.tsx
│   │   ├── sources/page.tsx
│   │   ├── answers/page.tsx
│   │   └── runs/page.tsx
│   ├── components/
│   │   ├── shell.tsx
│   │   ├── stat-card.tsx
│   │   ├── jobs-table.tsx
│   │   └── source-list.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   └── mock-data.ts
│   └── types/
│       └── index.ts
```

## Why this shape

- Frontend and backend are independently deployable.
- `shared/contracts.ts` captures API-facing domain types for eventual type generation or client alignment.
- Service modules isolate unstable integrations behind clear interfaces.
- Repositories keep persistence logic out of routes and services.
- Audit and run-history paths are first-class rather than bolted on later.
