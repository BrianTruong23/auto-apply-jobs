import { mockAnswers, mockJobs, mockRuns, mockSources } from "./mock-data";
import type { AnswerBankEntry, JobRecord, JobSource, Profile, RunLog } from "../types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api` : "http://localhost:3000/api");

async function fetchJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return fallback;
    }

    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export async function getJobs(): Promise<JobRecord[]> {
  const rows = await fetchJson<any[]>("/jobs", mockJobs);
  return rows.map((row) => ({
    id: row.id,
    company: row.company,
    title: row.title,
    location: row.location,
    workplaceMode: row.workplace_mode ?? row.workplaceMode,
    status: row.status,
    fitScore: row.fit_score ?? row.fitScore,
    source: row.source,
    sourceUrl: row.source_url ?? row.sourceUrl,
    applicationUrl: row.application_url ?? row.applicationUrl,
    postedAt: row.posted_at ?? row.postedAt,
    explanation: row.explanation ?? [],
  }));
}

export async function getProfile(): Promise<Profile> {
  const row = await fetchJson<any>("/profile", {
    id: "profile_1",
    fullName: "Alex Candidate",
    email: "alex@example.com",
    location: "New York, NY",
    summary: "Product-minded software engineer focused on AI-enabled workflow tools.",
    preferredRoles: ["Software Engineer", "Full Stack Engineer", "AI Product Engineer"],
    preferredLocations: ["New York, NY", "Remote"],
    preferredCompanies: ["OpenAI", "Stripe", "Notion"],
    skills: ["Python", "TypeScript", "Next.js", "FastAPI", "Postgres", "Playwright"],
  });
  return {
    id: row.id,
    fullName: row.full_name ?? row.fullName,
    email: row.email,
    location: row.location,
    summary: row.summary,
    preferredRoles: row.preferred_roles ?? row.preferredRoles ?? [],
    preferredLocations: row.preferred_locations ?? row.preferredLocations ?? [],
    preferredCompanies: row.preferred_companies ?? row.preferredCompanies ?? [],
    skills: row.skills ?? [],
  };
}

export async function getSources(): Promise<JobSource[]> {
  const rows = await fetchJson<any[]>("/sources", mockSources);
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    baseUrl: row.base_url ?? row.baseUrl,
    keywords: row.keywords ?? [],
    companies: row.companies ?? [],
    roles: row.roles ?? [],
    locations: row.locations ?? [],
    workplaceModes: row.workplace_modes ?? row.workplaceModes ?? [],
    enabled: row.enabled,
    lastCheckedAt: row.last_checked_at ?? row.lastCheckedAt,
  }));
}

export async function getAnswers(): Promise<AnswerBankEntry[]> {
  const rows = await fetchJson<any[]>("/answers", mockAnswers);
  return rows.map((row) => ({
    id: row.id,
    questionType: row.question_type ?? row.questionType,
    normalizedQuestion: row.normalized_question ?? row.normalizedQuestion,
    answerText: row.answer_text ?? row.answerText,
    usageCount: row.usage_count ?? row.usageCount,
    lastUsedAt: row.last_used_at ?? row.lastUsedAt,
  }));
}

export async function getRuns(): Promise<RunLog[]> {
  const rows = await fetchJson<any[]>("/runs", mockRuns);
  return rows.map((row) => ({
    id: row.id,
    runType: row.run_type ?? row.runType,
    status: row.status,
    startedAt: row.started_at ?? row.startedAt,
    finishedAt: row.finished_at ?? row.finishedAt,
    summary: row.summary,
  }));
}

export async function getDashboardData() {
  const [jobs, sources, answers, runs] = await Promise.all([getJobs(), getSources(), getAnswers(), getRuns()]);
  return { jobs, sources, answers, runs };
}
