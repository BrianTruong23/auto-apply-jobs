# Job Application Hub Architecture

## Concise Product Definition

Job Application Hub is a modular system for discovering, ranking, managing, and assisting with job applications while keeping a human in control of every consequential action.

## Assumptions

- Single primary user for MVP, with data model prepared for multi-user later.
- Brave Search is the first discovery provider.
- Spreadsheet sync targets Google Sheets first, but the database remains the source of truth.
- LLM answering already exists externally; this MVP defines the integration boundary and stores answer memory.
- Browser automation starts in assisted mode only. Final submission remains user-confirmed.

## System Architecture Diagram

```text
                           +----------------------+
                           |   Next.js Dashboard  |
                           | sources/jobs/runs    |
                           | answers/applications |
                           +----------+-----------+
                                      |
                                      | HTTPS / JSON
                                      v
 +-------------------+      +---------+----------+       +---------------------+
 | Brave Search API  +----->+   FastAPI Backend  +<----->+   Postgres DB       |
 +-------------------+      |                     |       | profiles/jobs/etc.  |
                            | API + orchestration |       +----------+----------+
 +-------------------+      +----+----+----+------+                  |
 | LLM Answer Engine +<----------+    |    +-------------------------+
 +-------------------+           |    |
                                 |    |
 +-------------------+           |    |      +----------------------+
 | Playwright Runner +<----------+    +----->+ Spreadsheet Adapter  |
 +-------------------+                  sync  | Google Sheets first |
                                              +----------------------+

Internal backend service boundaries
  - Source Manager
  - Discovery Service
  - Parsing/Normalization Service
  - Deduplication + Fit Scoring
  - Answer Bank / Question Reuse
  - Application Assistance Orchestrator
  - Spreadsheet Sync Service
  - Audit / Run Logging
```

## Modules / Services

- `frontend`: dashboard UI for profile, sources, jobs, answer bank, applications, and run history.
- `backend/api`: REST API surface.
- `backend/services/discovery`: Brave-powered job discovery and manual URL ingestion.
- `backend/services/parsing`: normalized job extraction and canonical field derivation.
- `backend/services/scoring`: fit scoring and rationale generation.
- `backend/services/answers`: question classification, prior-answer reuse, and LLM adapter boundary.
- `backend/services/automation`: browser-automation abstractions and assisted run orchestration.
- `backend/services/spreadsheet_sync`: sync jobs and application outcomes into spreadsheet rows.
- `backend/services/audit`: run logs, events, retries, and error capture.

## Proposed Database Schema

### Core entities

- `profiles`
  - `id`
  - `full_name`
  - `email`
  - `phone`
  - `location`
  - `linkedin_url`
  - `portfolio_url`
  - `summary`
  - `resume_text`
  - `preferences_json`
  - `created_at`
  - `updated_at`

- `work_experiences`
  - `id`
  - `profile_id`
  - `company`
  - `title`
  - `location`
  - `start_date`
  - `end_date`
  - `is_current`
  - `description`
  - `achievements_json`

- `projects`
  - `id`
  - `profile_id`
  - `name`
  - `url`
  - `description`
  - `skills_json`

- `job_sources`
  - `id`
  - `type` (`company_page`, `job_board`, `search_keyword`, `manual_url`, `preferred_company`)
  - `name`
  - `base_url`
  - `keywords_json`
  - `companies_json`
  - `roles_json`
  - `locations_json`
  - `workplace_modes_json`
  - `enabled`
  - `last_checked_at`
  - `created_at`
  - `updated_at`

- `source_runs`
  - `id`
  - `job_source_id`
  - `run_type` (`discovery`, `parse`, `sync`, `apply_assist`)
  - `status` (`queued`, `running`, `succeeded`, `failed`, `partial`)
  - `started_at`
  - `finished_at`
  - `metrics_json`
  - `error_message`
  - `log_excerpt`

- `jobs`
  - `id`
  - `canonical_key`
  - `company_name`
  - `company_normalized`
  - `title`
  - `title_normalized`
  - `location_text`
  - `location_normalized`
  - `workplace_mode`
  - `employment_type`
  - `seniority`
  - `description_text`
  - `requirements_text`
  - `salary_text`
  - `posted_at`
  - `deadline_at`
  - `source_url`
  - `application_url`
  - `source_type`
  - `raw_payload_json`
  - `normalized_payload_json`
  - `status` (`discovered`, `shortlisted`, `preparing`, `applying`, `submitted`, `rejected`, `interview`, `offer`, `archived`)
  - `fit_score`
  - `fit_explanation_json`
  - `created_at`
  - `updated_at`

- `job_source_links`
  - `id`
  - `job_id`
  - `job_source_id`
  - `external_job_id`
  - `discovered_at`

- `job_tags`
  - `id`
  - `job_id`
  - `tag`

- `job_notes`
  - `id`
  - `job_id`
  - `note`
  - `created_at`

- `applications`
  - `id`
  - `job_id`
  - `status`
  - `date_applied`
  - `follow_up_date`
  - `outcome`
  - `notes`
  - `current_step`
  - `last_activity_at`
  - `created_at`
  - `updated_at`

- `application_questions`
  - `id`
  - `application_id`
  - `question_text`
  - `question_type`
  - `normalized_question`
  - `similarity_key`
  - `suggested_answer`
  - `approved_answer`
  - `source` (`llm`, `reused`, `manual`)
  - `created_at`
  - `updated_at`

- `answer_bank_entries`
  - `id`
  - `profile_id`
  - `question_type`
  - `normalized_question`
  - `embedding_key`
  - `answer_text`
  - `evidence_json`
  - `usage_count`
  - `last_used_at`
  - `created_at`
  - `updated_at`

- `automation_runs`
  - `id`
  - `application_id`
  - `status`
  - `mode` (`manual`, `assisted`, `future_auto`)
  - `page_url`
  - `detected_fields_json`
  - `proposed_mappings_json`
  - `actions_json`
  - `failure_reason`
  - `started_at`
  - `finished_at`

- `spreadsheet_sync_runs`
  - `id`
  - `status`
  - `target_type`
  - `target_identifier`
  - `rows_written`
  - `started_at`
  - `finished_at`
  - `error_message`

- `audit_events`
  - `id`
  - `entity_type`
  - `entity_id`
  - `event_type`
  - `actor`
  - `payload_json`
  - `created_at`

## Job Normalization Strategy

- Normalize title, company, and location into canonical comparable fields.
- Keep raw payload alongside cleaned payload for auditability.
- Generate `canonical_key` from stable fields: normalized company + normalized title + normalized location + source/application URL hash.
- Parse structured hints such as workplace mode, seniority, salary text, and posted date into normalized fields.

## Deduplication Strategy

- Primary rule: exact `application_url` match or exact external job ID from same source.
- Secondary rule: exact `canonical_key`.
- Fallback fuzzy rule: similar company + similar title + similar location within a time window.
- Preserve many-to-one provenance using `job_source_links`.

## Similar Question Reuse Strategy

- Normalize question text through lowercasing, punctuation cleanup, and common phrase collapsing.
- Classify question type first: motivation, strengths, authorization, salary, diversity, availability, project example, leadership, conflict, etc.
- Search answer bank by `question_type` + normalized text similarity.
- Return reusable answer with explanation and evidence source.
- Later phase: replace string similarity with embeddings and semantic retrieval.

## Form Field Mapping Strategy

- Maintain a typed profile schema: personal info, links, work history, education, skills, salary expectations, authorization, sponsorship, demographics.
- Detect field intent from label, placeholder, HTML attributes, nearby text, and page section.
- Map fields to profile facts first, answer bank second, and LLM suggestions last.
- Never submit final forms automatically in MVP. User reviews proposed values and confirms each step.

## Partial Automation Failure Handling

- Every run emits structured events with timestamp, page URL, action, result, and screenshot reference later.
- Classify failures: unsupported layout, captcha, login wall, validation error, network timeout, ambiguous field mapping.
- Persist partial progress and proposed values so user can resume manually.
- Retry only idempotent steps. Never retry final submission automatically.

## Spreadsheet Sync Strategy

- Database remains source of truth.
- Sync process is one-way for MVP: DB to spreadsheet.
- Every job/application row stores sync metadata and last sync hash to avoid duplicate writes.
- Periodic reconciliation compares local row hash against last exported hash.

## Phased Roadmap

### Phase 1: MVP

- Single-user profile and resume store
- Source input and source enable/disable
- Brave Search discovery
- Manual URL ingestion
- Normalization, deduplication, and fit scoring
- Job dashboard and application status tracking
- Answer bank CRUD + draft-answer integration boundary
- Spreadsheet sync adapter
- Audit events and run history

### Phase 2: Smarter Assistance

- Better parsing for known job boards
- Question similarity retrieval with embeddings
- Assisted browser application flows with saved mappings
- Resume tailoring suggestions
- Deadline/follow-up automation

### Phase 3: Higher Autonomy

- Multi-step autonomous application execution for supported sites
- Agentic research on companies and role fit
- Cross-run learning of field mappings
- Human approval gates at configurable checkpoints

## Technical Risks

- Web job data is inconsistent and often poorly structured.
- Job deduplication can create false merges or false splits.
- Browser automation is brittle across applicant tracking systems.
- Captchas, logins, and anti-bot systems limit automation.
- LLM answer reuse can drift into stale or over-generic responses.
- Spreadsheet sync can become inconsistent without idempotent row keys.
- Queue/retry behavior must avoid duplicate actions and duplicate syncs.
- Storing resume/profile/application data requires careful handling of sensitive data.
