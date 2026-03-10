"use client";

import { useState } from "react";

import type { AnswerBankEntry, DraftAnswerResult } from "../types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/api` : "http://localhost:3000/api");

export function AnswerWorkbench({ initialAnswers }: { initialAnswers: AnswerBankEntry[] }) {
  const [question, setQuestion] = useState("Why do you want to work here?");
  const [company, setCompany] = useState("OpenAI");
  const [role, setRole] = useState("Software Engineer");
  const [jobDescription, setJobDescription] = useState("");
  const [draftState, setDraftState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [draft, setDraft] = useState<DraftAnswerResult | null>(null);

  async function generateDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDraftState("loading");
    setDraft(null);

    try {
      const response = await fetch(`${API_BASE_URL}/answers/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          company,
          role,
          job_description: jobDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Draft request failed");
      }

      const result = (await response.json()) as {
        question_type?: string;
        suggested_answer?: string;
        reused_answer_id?: string | null;
        rationale?: string[];
      };
      setDraft({
        questionType: result.question_type ?? "general",
        suggestedAnswer: result.suggested_answer ?? "",
        reusedAnswerId: result.reused_answer_id ?? null,
        rationale: result.rationale ?? [],
      });
      setDraftState("done");
    } catch {
      setDraftState("error");
    }
  }

  return (
    <div className="stack">
      <article className="answer-card">
        <h2>Draft an answer</h2>
        <form className="form-grid" onSubmit={generateDraft}>
          <label className="field field-full">
            <span>Question</span>
            <textarea rows={3} value={question} onChange={(event) => setQuestion(event.target.value)} />
          </label>
          <label className="field">
            <span>Company</span>
            <input value={company} onChange={(event) => setCompany(event.target.value)} />
          </label>
          <label className="field">
            <span>Role</span>
            <input value={role} onChange={(event) => setRole(event.target.value)} />
          </label>
          <label className="field field-full">
            <span>Job description context</span>
            <textarea rows={5} value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} />
          </label>
          <div className="form-actions field-full">
            <button className="button-primary" type="submit" disabled={draftState === "loading"}>
              {draftState === "loading" ? "Generating..." : "Generate draft"}
            </button>
            {draftState === "error" ? (
              <span className="inline-message inline-error">Draft generation failed. Check backend and OpenRouter config.</span>
            ) : null}
          </div>
        </form>
        {draft ? (
          <div className="result-panel">
            <p><strong>Type:</strong> {draft.questionType}</p>
            <p><strong>Source:</strong> {draft.reusedAnswerId ? `Reused ${draft.reusedAnswerId}` : "Fresh draft"}</p>
            <p>{draft.suggestedAnswer}</p>
            <p className="muted">{draft.rationale.join(" • ")}</p>
          </div>
        ) : null}
      </article>

      <div className="stack">
        {initialAnswers.map((answer) => (
          <article className="answer-card" key={answer.id}>
            <div className="row">
              <strong>{answer.questionType}</strong>
              <span className="badge">{answer.usageCount} uses</span>
            </div>
            <p className="muted">{answer.normalizedQuestion}</p>
            <p>{answer.answerText}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
