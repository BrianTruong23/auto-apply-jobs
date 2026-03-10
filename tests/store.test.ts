import test from "node:test";
import assert from "node:assert/strict";

import { mapDbData, nextId } from "../lib/server/store-shared.ts";

test("maps database rows into app data shape", () => {
  const mapped = mapDbData({
    profiles: [
      {
        id: "profile_1",
        full_name: "Test User",
        email: "test@example.com",
        location: "Remote",
        summary: "Summary",
        resume_text: "Resume",
        preferred_roles: ["Engineer"],
        preferred_locations: ["Remote"],
        preferred_companies: ["OpenAI"],
        skills: ["TypeScript"],
      },
    ],
    sources: [
      {
        id: "src_1",
        name: "Source",
        type: "search_keyword",
        base_url: "https://example.com",
        keywords: ["ai jobs"],
        companies: ["OpenAI"],
        roles: ["Engineer"],
        locations: ["Remote"],
        workplace_modes: ["remote"],
        enabled: true,
        last_checked_at: "2026-03-10T00:00:00Z",
      },
    ],
    jobs: [
      {
        id: "job_1",
        canonical_key: "openai-engineer-remote",
        company: "OpenAI",
        title: "Engineer",
        location: "Remote",
        workplace_mode: "remote",
        status: "discovered",
        fit_score: 91,
        source: "Brave Search",
        source_url: "https://example.com/job",
        application_url: "https://example.com/apply",
        posted_at: "2026-03-10T00:00:00Z",
        explanation: ["Strong fit"],
        description_text: "Job description",
        raw_payload: { id: 1 },
        normalized_payload: { company: "OpenAI" },
      },
    ],
    answers: [
      {
        id: "ans_1",
        question_type: "motivation",
        normalized_question: "why do you want to work here",
        answer_text: "Because impact.",
        usage_count: 2,
        last_used_at: "2026-03-10T00:00:00Z",
      },
    ],
    applications: [
      {
        id: "app_1",
        job_id: "job_1",
        company: "OpenAI",
        title: "Engineer",
        status: "preparing",
        current_step: "Resume review",
        outcome: null,
        notes: "Need tailored resume",
      },
    ],
    runs: [
      {
        id: "run_1",
        run_type: "discovery",
        status: "succeeded",
        started_at: "2026-03-10T00:00:00Z",
        finished_at: "2026-03-10T00:01:00Z",
        summary: "Discovery done",
      },
    ],
  });

  assert.equal(mapped.profile.full_name, "Test User");
  assert.deepEqual(mapped.sources[0].keywords, ["ai jobs"]);
  assert.equal(mapped.jobs[0].fit_score, 91);
  assert.equal(mapped.answers[0].question_type, "motivation");
  assert.equal(mapped.applications[0].current_step, "Resume review");
  assert.equal(mapped.runs[0].run_type, "discovery");
});

test("creates the next sequential id", () => {
  assert.equal(nextId("job", ["job_1", "job_4", "job_9"]), "job_10");
  assert.equal(nextId("app", []), "app_1");
});
