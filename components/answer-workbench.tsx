"use client";

import { useMemo, useState } from "react";

import { assertApiResponse, formatApiErrorMessage, getClientApiBaseUrl } from "@/lib/client-api";
import type { AnswerBankEntry, DraftAnswerResult } from "../types";

type EntryStatus = "approved" | "review_needed" | "draft";
type EntryCategory = "behavioral" | "motivation" | "company" | "technical" | "compensation";

type WorkspaceEntry = {
  id: string;
  questionType: string;
  normalizedQuestion: string;
  companyContext?: string;
  roleContext?: string;
  answerText: string;
  usageCount: number;
  lastUsedAt?: string;
  status: EntryStatus;
  category: EntryCategory;
  lastUpdated: string;
  changeSummary: string;
  sourceLabel: string;
};

const seededEntries: WorkspaceEntry[] = [
  {
    id: "seed_why_company_openai",
    questionType: "motivation",
    normalizedQuestion: "Why do you want to work here?",
    companyContext: "OpenAI",
    roleContext: "Software Engineer",
    answerText:
      "I want to work at OpenAI because the role sits at the intersection of high-leverage product engineering and infrastructure quality. My strongest work has been building internal systems that remove friction for teams, and this role has the same shape: translating ambiguous operational needs into durable tooling that improves execution across the organization.",
    usageCount: 7,
    lastUsedAt: "2026-03-08",
    status: "approved",
    category: "company",
    lastUpdated: "Mar 8, 2026",
    changeSummary: "Tailored for internal tools and recruiting operations.",
    sourceLabel: "Approved company-specific answer",
  },
  {
    id: "seed_challenge_general",
    questionType: "behavioral",
    normalizedQuestion: "Tell me about a challenge you overcame.",
    answerText:
      "A recent challenge was stabilizing a workflow platform that had become difficult to ship changes to because every team had introduced its own edge-case logic. I led a refactor that separated the core orchestration model from client-specific rules, added audit logging around every transition, and shipped the migration in slices. The result was a faster release cycle and fewer support escalations because the system became easier to reason about.",
    usageCount: 11,
    lastUsedAt: "2026-03-05",
    status: "approved",
    category: "behavioral",
    lastUpdated: "Mar 5, 2026",
    changeSummary: "Updated with workflow-platform example and measurable result.",
    sourceLabel: "Approved reusable answer",
  },
  {
    id: "seed_project_proud",
    questionType: "project",
    normalizedQuestion: "Describe a project you are proud of.",
    answerText:
      "I am proud of the application operations hub I built to make job search execution less ad hoc. The project combined job discovery, structured tracking, reusable answers, and reviewable automation into one system. What made it valuable was not just automation, but the ability to inspect every step, intervene when needed, and keep high-context decisions in human hands.",
    usageCount: 4,
    lastUsedAt: "2026-03-01",
    status: "approved",
    category: "technical",
    lastUpdated: "Mar 1, 2026",
    changeSummary: "Added stronger framing around human-in-the-loop design.",
    sourceLabel: "Approved reusable answer",
  },
  {
    id: "seed_why_company_stripe",
    questionType: "motivation",
    normalizedQuestion: "Why this company?",
    companyContext: "Stripe",
    roleContext: "Product Engineer",
    answerText:
      "Stripe appeals to me because it treats operational quality as a product problem, not just an engineering problem. I am motivated by environments where internal tooling, user experience, and system reliability reinforce one another, and Stripe consistently operates at that standard.",
    usageCount: 3,
    lastUsedAt: "2026-02-25",
    status: "review_needed",
    category: "company",
    lastUpdated: "Feb 25, 2026",
    changeSummary: "Needs a fresher product-engineering example.",
    sourceLabel: "Needs refresh",
  },
  {
    id: "seed_compensation",
    questionType: "compensation",
    normalizedQuestion: "What are your compensation expectations?",
    answerText:
      "I prefer to calibrate against the full scope of the role, level expectations, and overall package. Based on similar roles, I am targeting a market-competitive range, but I am flexible if the opportunity is a strong mutual fit.",
    usageCount: 5,
    lastUsedAt: "2026-02-20",
    status: "draft",
    category: "compensation",
    lastUpdated: "Feb 20, 2026",
    changeSummary: "Draft only. Needs tighter range language before approval.",
    sourceLabel: "Draft response",
  },
];

const categoryLabels: Record<EntryCategory | "all", string> = {
  all: "All answers",
  behavioral: "Behavioral",
  motivation: "Motivation",
  company: "Company-specific",
  technical: "Projects and technical",
  compensation: "Compensation",
};

function normalizeEntry(answer: AnswerBankEntry): WorkspaceEntry {
  const question = answer.normalizedQuestion.toLowerCase();
  let category: EntryCategory = "behavioral";
  if (question.includes("why") && answer.companyContext) category = "company";
  else if (question.includes("why")) category = "motivation";
  else if (question.includes("project") || question.includes("build")) category = "technical";
  else if (question.includes("salary") || question.includes("compensation")) category = "compensation";

  return {
    id: answer.id,
    questionType: answer.questionType,
    normalizedQuestion: answer.normalizedQuestion,
    companyContext: answer.companyContext,
    roleContext: answer.roleContext,
    answerText: answer.answerText,
    usageCount: answer.usageCount,
    lastUsedAt: answer.lastUsedAt,
    status: answer.usageCount > 6 ? "approved" : answer.companyContext ? "review_needed" : "draft",
    category,
    lastUpdated: answer.lastUsedAt ?? "Recently updated",
    changeSummary: answer.companyContext ? "Scoped to a specific company." : "Reusable across applications.",
    sourceLabel: answer.companyContext ? "Saved tailored answer" : "Saved reusable answer",
  };
}

function getStatusLabel(status: EntryStatus) {
  if (status === "approved") return "Approved";
  if (status === "review_needed") return "Needs review";
  return "Draft";
}

function getStatusTone(status: EntryStatus) {
  if (status === "approved") return "bg-emerald-500";
  if (status === "review_needed") return "bg-amber-500";
  return "bg-slate-400";
}

function mergeEntries(initialAnswers: AnswerBankEntry[]) {
  const mapped = initialAnswers.map(normalizeEntry);
  const existingIds = new Set(mapped.map((entry) => entry.id));
  const extras = seededEntries.filter((entry) => !existingIds.has(entry.id));
  return [...mapped, ...extras];
}

function shortPreview(text: string) {
  return text.length > 170 ? `${text.slice(0, 167)}...` : text;
}

export function AnswerWorkbench({ initialAnswers }: { initialAnswers: AnswerBankEntry[] }) {
  const entries = useMemo(() => mergeEntries(initialAnswers), [initialAnswers]);
  const [selectedCategory, setSelectedCategory] = useState<EntryCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(entries[0]?.id ?? "");
  const [question, setQuestion] = useState(entries[0]?.normalizedQuestion ?? "Why do you want to work here?");
  const [company, setCompany] = useState(entries[0]?.companyContext ?? "OpenAI");
  const [role, setRole] = useState(entries[0]?.roleContext ?? "Software Engineer");
  const [jobDescription, setJobDescription] = useState("");
  const [draftText, setDraftText] = useState(entries[0]?.answerText ?? "");
  const [draftState, setDraftState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [draft, setDraft] = useState<DraftAnswerResult | null>(null);
  const [message, setMessage] = useState("");

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesCategory = selectedCategory === "all" || entry.category === selectedCategory;
      const haystack = [
        entry.normalizedQuestion,
        entry.answerText,
        entry.companyContext,
        entry.roleContext,
        entry.questionType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !search || haystack.includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [entries, search, selectedCategory]);

  const selectedEntry =
    filteredEntries.find((entry) => entry.id === selectedId) ??
    entries.find((entry) => entry.id === selectedId) ??
    filteredEntries[0] ??
    entries[0] ??
    null;

  const approvedCount = entries.filter((entry) => entry.status === "approved").length;
  const refreshCount = entries.filter((entry) => entry.status === "review_needed").length;
  const draftCount = entries.filter((entry) => entry.status === "draft").length;
  const recentlyReused = [...entries].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0)).slice(0, 3);
  const relatedEntries = entries
    .filter((entry) => entry.id !== selectedEntry?.id)
    .filter((entry) =>
      selectedEntry
        ? entry.category === selectedEntry.category || entry.questionType === selectedEntry.questionType
        : true,
    )
    .slice(0, 3);

  function selectEntry(entry: WorkspaceEntry) {
    setSelectedId(entry.id);
    setQuestion(entry.normalizedQuestion);
    setCompany(entry.companyContext ?? "");
    setRole(entry.roleContext ?? "");
    setDraftText(entry.answerText);
    setDraft(null);
    setMessage("");
  }

  async function generateDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDraftState("loading");
    setDraft(null);
    setMessage("");

    try {
      const response = await fetch(`${getClientApiBaseUrl()}/api/answers/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          company,
          role,
          job_description: jobDescription,
        }),
      });

      await assertApiResponse(response);

      const result = (await response.json()) as {
        question_type?: string;
        suggested_answer?: string;
        reused_answer_id?: string | null;
        rationale?: string[];
      };

      const nextDraft: DraftAnswerResult = {
        questionType: result.question_type ?? "general",
        suggestedAnswer: result.suggested_answer ?? "",
        reusedAnswerId: result.reused_answer_id ?? null,
        rationale: result.rationale ?? [],
      };

      setDraft(nextDraft);
      setDraftText(nextDraft.suggestedAnswer);
      setDraftState("done");
      setMessage(nextDraft.reusedAnswerId ? "Loaded a saved answer as the starting point." : "Suggested answer ready for review.");
    } catch (error) {
      setDraftState("error");
      setMessage(formatApiErrorMessage(error, "Could not prepare a suggested answer. Check the answer service configuration."));
    }
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)_300px]">
      <aside className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Answer library</p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-slate-950">Approved responses</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Search reusable answers, review what is stale, and open the best starting point before editing.</p>
          </div>
          <button className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white" type="button">
            New answer
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Approved</div>
            <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">{approvedCount}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Needs refresh</div>
            <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">{refreshCount}</div>
          </div>
        </div>

        <div className="mt-4">
          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
            placeholder="Search question, company, or answer text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(Object.keys(categoryLabels) as Array<EntryCategory | "all">).map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                type="button"
                onClick={() => setSelectedCategory(category)}
              >
                {categoryLabels[category]}
              </button>
            );
          })}
        </div>

        <div className="mt-5 space-y-3">
          {filteredEntries.length ? (
            filteredEntries.map((entry) => {
              const active = entry.id === selectedEntry?.id;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => selectEntry(entry)}
                  className={`block w-full rounded-2xl border px-4 py-4 text-left transition ${
                    active
                      ? "border-slate-900 bg-slate-950 text-white shadow-[0_12px_28px_rgba(15,23,42,0.18)]"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-blue-300" : getStatusTone(entry.status)}`} />
                      <span className={`text-xs font-semibold uppercase tracking-[0.14em] ${active ? "text-slate-300" : "text-slate-500"}`}>
                        {getStatusLabel(entry.status)}
                      </span>
                    </div>
                    <span className={`text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>{entry.usageCount} reuses</span>
                  </div>
                  <h3 className={`mt-3 text-sm font-semibold leading-6 ${active ? "text-white" : "text-slate-950"}`}>{entry.normalizedQuestion}</h3>
                  <p className={`mt-2 text-sm leading-6 ${active ? "text-slate-300" : "text-slate-600"}`}>{shortPreview(entry.answerText)}</p>
                  <div className={`mt-3 flex items-center gap-2 text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>
                    <span>{entry.companyContext || "General"}</span>
                    <span>&middot;</span>
                    <span>{entry.lastUpdated}</span>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-sm text-slate-600">
              <p className="font-medium text-slate-900">No answers match this view.</p>
              <p className="mt-2 leading-6">Try a broader search or create a new approved answer for the category you need.</p>
              <button className="mt-4 rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white" type="button">
                Create answer
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className="space-y-5">
        <section className="rounded-3xl border border-white/70 bg-white/88 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200/80 pb-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Response editor</p>
              <h2 className="mt-2 text-[1.75rem] font-semibold tracking-[-0.04em] text-slate-950">
                {selectedEntry?.normalizedQuestion || question || "Suggested answer"}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Start from a saved answer when possible, adjust it for the role and company, and only approve once the response reads like something you would actually send.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50" type="button">
                Import answers
              </button>
              <button className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50" type="button">
                Review stale answers
              </button>
              <button className="rounded-xl bg-slate-950 px-3.5 py-2 text-sm font-medium text-white shadow-[0_12px_24px_rgba(15,23,42,0.18)] transition hover:bg-slate-800" type="submit" form="answer-draft-form">
                Generate draft
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <form className="space-y-4" id="answer-draft-form" onSubmit={generateDraft}>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Question</span>
                <textarea
                  className="mt-2 min-h-[100px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Company</span>
                  <input
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Role</span>
                  <input
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Role context</span>
                <textarea
                  className="mt-2 min-h-[120px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="Paste job description details, team context, or company notes that should shape the answer."
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                />
              </label>
            </form>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Current source</p>
                  <h3 className="mt-2 text-base font-semibold text-slate-950">
                    {draft?.reusedAnswerId ? "Based on saved answers" : selectedEntry?.sourceLabel || "Selected library answer"}
                  </h3>
                </div>
                <div className="text-right text-sm text-slate-500">
                  <div>{selectedEntry?.lastUpdated || "Recently updated"}</div>
                  <div className="mt-1">{selectedEntry?.usageCount || 0} prior reuses</div>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {selectedEntry?.changeSummary || "Use this as a controlled starting point, then review tone, specificity, and evidence before approving."}
              </p>
              {message ? (
                <div className={`mt-4 rounded-xl px-3 py-2 text-sm ${draftState === "error" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
                  {message}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Draft</p>
                <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-slate-950">Suggested answer</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50" type="button">
                  Copy
                </button>
                <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50" type="button">
                  Compare
                </button>
                <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50" type="button">
                  Save
                </button>
                <button className="rounded-xl bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800" type="button">
                  Approve
                </button>
              </div>
            </div>

            <textarea
              className="mt-4 min-h-[360px] w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-[15px] leading-7 text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
              value={draftText}
              onChange={(event) => setDraftText(event.target.value)}
              placeholder="Select a saved answer or generate a role-specific draft to start editing."
            />

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span>{draft?.reusedAnswerId ? "Started from a saved answer" : "Editing workspace"}</span>
              <span>&middot;</span>
              <span>{company || "General company context"}</span>
              <span>&middot;</span>
              <span>{role || "General role context"}</span>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/70 bg-white/88 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Recent changes</p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-slate-950">Version and review history</h2>
            </div>
            <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50" type="button">
              View all versions
            </button>
          </div>

          <div className="mt-5 grid gap-3">
            <div className="flex items-start justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div>
                <div className="text-sm font-medium text-slate-950">Edited company-specific motivation answer</div>
                <div className="mt-1 text-sm leading-6 text-slate-600">Refined the first paragraph to emphasize internal systems experience and removed vague mission language.</div>
              </div>
              <div className="text-right text-sm text-slate-500">
                <div>Mar 8, 2026</div>
                <div className="mt-1">Approved</div>
              </div>
            </div>
            <div className="flex items-start justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div>
                <div className="text-sm font-medium text-slate-950">Reused challenge answer for two screening forms</div>
                <div className="mt-1 text-sm leading-6 text-slate-600">Applied the workflow-platform example with minor edits for tone and metrics.</div>
              </div>
              <div className="text-right text-sm text-slate-500">
                <div>Mar 5, 2026</div>
                <div className="mt-1">2 reuses</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <aside className="space-y-5">
        <section className="rounded-3xl border border-white/70 bg-white/88 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Review context</p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-slate-950">Current answer status</h2>
          </div>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Status</div>
              <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-900">
                <span className={`h-2.5 w-2.5 rounded-full ${getStatusTone(selectedEntry?.status ?? "draft")}`} />
                {getStatusLabel(selectedEntry?.status ?? "draft")}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Provenance</div>
              <div className="mt-2 text-sm leading-6 text-slate-700">{draft?.reusedAnswerId ? "Prepared from a previously saved answer." : selectedEntry?.sourceLabel || "No saved source selected."}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Last updated</div>
              <div className="mt-2 text-sm font-medium text-slate-900">{selectedEntry?.lastUpdated || "Not yet updated"}</div>
              <div className="mt-1 text-sm text-slate-600">{selectedEntry?.changeSummary || "No change summary available."}</div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/70 bg-white/88 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Related answers</p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-slate-950">Good starting points</h2>
            </div>
            <div className="text-sm text-slate-500">{relatedEntries.length} matches</div>
          </div>
          <div className="mt-4 space-y-3">
            {relatedEntries.length ? (
              relatedEntries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => selectEntry(entry)}
                  className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-slate-300 hover:bg-white"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-slate-950">{entry.normalizedQuestion}</div>
                    <span className="text-xs text-slate-500">{entry.usageCount} reuses</span>
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">{shortPreview(entry.answerText)}</div>
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                No related saved answers yet. Start by approving one strong response in this category.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-white/70 bg-white/88 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Queue</p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-slate-950">Operational details</h2>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-slate-600">Approved answers</span>
              <strong className="text-slate-950">{approvedCount}</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-slate-600">Awaiting review</span>
              <strong className="text-slate-950">{refreshCount + draftCount}</strong>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Recently reused</div>
              <div className="mt-3 space-y-3">
                {recentlyReused.map((entry) => (
                  <div key={entry.id} className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-slate-950">{entry.normalizedQuestion}</div>
                      <div className="mt-1 text-sm text-slate-600">{entry.companyContext || "General use"}</div>
                    </div>
                    <div className="text-xs text-slate-500">{entry.usageCount} uses</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Review checklist</div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                <li>Make sure the answer uses concrete evidence instead of generic enthusiasm.</li>
                <li>Check whether the company and role context are actually reflected in the final copy.</li>
                <li>Approve only responses that you would be comfortable reusing without major edits.</li>
              </ul>
            </div>
          </div>
        </section>
      </aside>
    </section>
  );
}
