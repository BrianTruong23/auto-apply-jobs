import { cookies } from "next/headers";

import type { AnswerBankEntry, ApplicationRecord, JobDetailResult, JobRecord, JobSource, Profile, RunLog } from "../types";
import { ACCESS_TOKEN_COOKIE } from "./server/auth";

function getServerApiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (configured) {
    if (process.env.VERCEL_URL && configured.includes("localhost")) {
      return `https://${process.env.VERCEL_URL}/api`;
    }
    return configured;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api`;
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return `${process.env.NEXT_PUBLIC_APP_URL}/api`;
  }

  return "http://localhost:3000/api";
}

async function fetchJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    const response = await fetch(`${getServerApiBaseUrl()}${path}`, {
      next: { revalidate: 0 },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
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
  const rows = await fetchJson<any[]>("/jobs", []);
  return rows.map((row) => ({
    id: row.id,
    canonicalKey: row.canonical_key ?? row.canonicalKey,
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
    descriptionText: row.description_text ?? row.descriptionText,
  }));
}

export async function getProfile(): Promise<Profile> {
  const row = await fetchJson<any>("/profile", {
    id: "profile_1",
    fullName: "",
    email: "",
    location: "",
    summary: "",
    resumeText: "",
    preferredRoles: [],
    preferredLocations: [],
    preferredCompanies: [],
    skills: [],
  });
  return {
    id: row.id,
    fullName: row.full_name ?? row.fullName,
    email: row.email,
    location: row.location,
    summary: row.summary,
    resumeText: row.resume_text ?? row.resumeText ?? "",
    preferredRoles: row.preferred_roles ?? row.preferredRoles ?? [],
    preferredLocations: row.preferred_locations ?? row.preferredLocations ?? [],
    preferredCompanies: row.preferred_companies ?? row.preferredCompanies ?? [],
    skills: row.skills ?? [],
  };
}

export async function getSources(): Promise<JobSource[]> {
  const rows = await fetchJson<any[]>("/sources", []);
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
  const rows = await fetchJson<any[]>("/answers", []);
  return rows.map((row) => ({
    id: row.id,
    questionType: row.question_type ?? row.questionType,
    normalizedQuestion: row.normalized_question ?? row.normalizedQuestion,
    companyContext: row.company_context ?? row.companyContext ?? undefined,
    roleContext: row.role_context ?? row.roleContext ?? undefined,
    answerText: row.answer_text ?? row.answerText,
    usageCount: row.usage_count ?? row.usageCount,
    lastUsedAt: row.last_used_at ?? row.lastUsedAt,
  }));
}

export async function getRuns(): Promise<RunLog[]> {
  const rows = await fetchJson<any[]>("/runs", []);
  return rows.map((row) => ({
    id: row.id,
    runType: row.run_type ?? row.runType,
    status: row.status,
    startedAt: row.started_at ?? row.startedAt,
    finishedAt: row.finished_at ?? row.finishedAt,
    summary: row.summary,
  }));
}

export async function getJob(jobId: string): Promise<JobDetailResult | null> {
  const row = await fetchJson<any | null>(`/jobs/${jobId}`, null);
  if (!row) {
    return null;
  }

  return {
    job: {
      id: row.job.id,
      canonicalKey: row.job.canonical_key ?? row.job.canonicalKey,
      company: row.job.company,
      title: row.job.title,
      location: row.job.location,
      workplaceMode: row.job.workplace_mode ?? row.job.workplaceMode,
      status: row.job.status,
      fitScore: row.job.fit_score ?? row.job.fitScore,
      source: row.job.source,
      sourceUrl: row.job.source_url ?? row.job.sourceUrl,
      applicationUrl: row.job.application_url ?? row.job.applicationUrl,
      postedAt: row.job.posted_at ?? row.job.postedAt,
      explanation: row.job.explanation ?? [],
      descriptionText: row.job.description_text ?? row.job.descriptionText,
    },
    applications: (row.applications ?? []).map(mapApplication),
    latestApplication: row.latestApplication ? mapApplication(row.latestApplication) : null,
  };
}

export async function getApplications(): Promise<ApplicationRecord[]> {
  const rows = await fetchJson<any[]>("/applications", []);
  return rows.map(mapApplication);
}

function mapApplication(row: any): ApplicationRecord {
  return {
    id: row.id,
    jobId: row.job_id ?? row.jobId,
    company: row.company,
    title: row.title,
    status: row.status,
    currentStep: row.current_step ?? row.currentStep,
    outcome: row.outcome ?? undefined,
    notes: row.notes,
  };
}

export async function getDashboardData() {
  const [jobs, sources, answers, runs] = await Promise.all([getJobs(), getSources(), getAnswers(), getRuns()]);
  return { jobs, sources, answers, runs };
}

export async function getHealth(): Promise<{
  status: string;
  persistence_mode: string;
  supabase_configured: boolean;
  brave_configured: boolean;
  openrouter_configured: boolean;
}> {
  return fetchJson("/health", {
    status: "ok",
    persistence_mode: "file",
    supabase_configured: false,
    brave_configured: false,
    openrouter_configured: false,
  });
}

export async function isAuthenticated() {
  return Boolean((await cookies()).get(ACCESS_TOKEN_COOKIE)?.value);
}
