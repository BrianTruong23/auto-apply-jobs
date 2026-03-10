import test from "node:test";
import assert from "node:assert/strict";

import { createApplicationRecord, getJobDetail, updateApplicationRecord } from "../lib/server/application-logic.ts";
import type { AppData, JobRecord } from "../lib/server/store-shared.ts";

function makeJob(): JobRecord {
  return {
    id: "job_1",
    canonical_key: "openai-engineer-remote",
    company: "OpenAI",
    title: "Engineer",
    location: "Remote",
    workplace_mode: "remote",
    status: "discovered",
    fit_score: 92,
    source: "Brave Search",
    source_url: "https://example.com/job",
    application_url: "https://example.com/apply",
    posted_at: "2026-03-10T00:00:00Z",
    explanation: ["Strong fit"],
    description_text: "Build useful systems.",
    raw_payload: {},
    normalized_payload: {},
  };
}

function makeData(): AppData {
  return {
    profile: {
      id: "profile_1",
      full_name: "Test User",
      email: "test@example.com",
      location: "Remote",
      summary: "Summary",
      resume_text: "",
      preferred_roles: ["Engineer"],
      preferred_locations: ["Remote"],
      preferred_companies: ["OpenAI"],
      skills: ["TypeScript"],
    },
    sources: [],
    jobs: [makeJob()],
    answers: [],
    applications: [
      {
        id: "app_1",
        job_id: "job_1",
        company: "OpenAI",
        title: "Engineer",
        status: "preparing",
        current_step: "Resume tailoring",
        notes: "Need one more example",
      },
    ],
    runs: [],
  };
}

test("builds job detail with related applications", () => {
  const detail = getJobDetail(makeData(), "job_1");
  assert.ok(detail);
  assert.equal(detail.job.company, "OpenAI");
  assert.equal(detail.applications.length, 1);
  assert.equal(detail.latestApplication?.status, "preparing");
});

test("creates an application record from a job", () => {
  const record = createApplicationRecord({
    id: "app_2",
    job: makeJob(),
    status: "submitted",
    current_step: "Done",
    notes: "Submitted through careers page",
  });

  assert.equal(record.job_id, "job_1");
  assert.equal(record.company, "OpenAI");
  assert.equal(record.status, "submitted");
  assert.match(record.notes, /Submitted/);
});

test("updates only the provided fields on an application record", () => {
  const updated = updateApplicationRecord(
    {
      id: "app_1",
      job_id: "job_1",
      company: "OpenAI",
      title: "Engineer",
      status: "preparing",
      current_step: "Resume tailoring",
      notes: "Old note",
    },
    {
      status: "interview",
      notes: "Recruiter screen scheduled",
    },
  );

  assert.equal(updated.status, "interview");
  assert.equal(updated.current_step, "Resume tailoring");
  assert.equal(updated.notes, "Recruiter screen scheduled");
});
