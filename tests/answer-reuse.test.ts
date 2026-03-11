import assert from "node:assert/strict";
import test from "node:test";

import { normalizeAnswerScope, selectReusableAnswer } from "../lib/server/answer-reuse.ts";
import type { AnswerRecord } from "../lib/server/store-shared.ts";

const answers: AnswerRecord[] = [
  {
    id: "ans_1",
    question_type: "motivation",
    normalized_question: "why do you want to work here",
    answer_text: "Generic motivation answer.",
    usage_count: 1,
  },
  {
    id: "ans_2",
    question_type: "motivation",
    normalized_question: "why do you want to work here",
    company_context: "OpenAI",
    answer_text: "OpenAI-specific motivation answer.",
    usage_count: 2,
  },
];

test("reuses a company-scoped answer when company matches", () => {
  const reused = selectReusableAnswer(answers, {
    normalizedQuestion: normalizeAnswerScope("Why do you want to work here?"),
    questionType: "motivation",
    company: "OpenAI",
  });

  assert.equal(reused?.id, "ans_2");
});

test("does not reuse a generic answer when company context is present but no scoped answer exists", () => {
  const reused = selectReusableAnswer(answers, {
    normalizedQuestion: normalizeAnswerScope("Why do you want to work here?"),
    questionType: "motivation",
    company: "Stripe",
  });

  assert.equal(reused, null);
});

test("can still reuse a generic answer when no company is supplied", () => {
  const reused = selectReusableAnswer(answers, {
    normalizedQuestion: normalizeAnswerScope("Why do you want to work here?"),
    questionType: "motivation",
  });

  assert.equal(reused?.id, "ans_1");
});
