# First-Pass Implementation Plan

## Priority 1: Reliable Data Foundation

1. Finalize Postgres schema and migrations.
2. Replace example responses with repository-backed persistence.
3. Add audit events for all mutations and queued runs.
4. Introduce row-level idempotency keys for jobs, applications, and spreadsheet sync.

## Priority 2: Discovery Pipeline

1. Implement Brave Search client with retries, rate-limit handling, and source run logging.
2. Add manual URL ingestion.
3. Build job parsing and normalization pipeline.
4. Add deduplication rules with provenance tracking.
5. Persist fit score and explanation per job.

## Priority 3: Core Product Workflows

1. Build CRUD for profile, job sources, jobs, and applications.
2. Add dashboard filtering by status, source, location, company, and score threshold.
3. Add answer bank CRUD plus question classification and reuse lookup.
4. Add spreadsheet sync runner with dry-run and commit modes.

## Priority 4: Assisted Application Mode

1. Define browser automation adapter around page open, field detection, mapping, and confirmation checkpoints.
2. Log all actions and failures into automation runs.
3. Support pause/resume for partial failures and unsupported flows.

## Priority 5: Hardening

1. Add background queue for discovery, sync, and application-assist runs.
2. Add tests for normalization, deduplication, scoring, and answer reuse.
3. Add auth and secrets handling before any hosted deployment.
4. Add observability around retries, failures, and latency per integration.
