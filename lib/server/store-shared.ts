export type ProfileRecord = {
  id: string;
  user_id?: string;
  full_name: string;
  email: string;
  location: string;
  summary: string;
  resume_text: string;
  preferred_roles: string[];
  preferred_locations: string[];
  preferred_companies: string[];
  skills: string[];
};

export type SourceRecord = {
  id: string;
  user_id?: string;
  name: string;
  type: string;
  base_url?: string;
  keywords: string[];
  companies: string[];
  roles: string[];
  locations: string[];
  workplace_modes: string[];
  enabled: boolean;
  last_checked_at?: string;
};

export type JobRecord = {
  id: string;
  user_id?: string;
  canonical_key: string;
  company: string;
  title: string;
  location: string;
  workplace_mode: string;
  status: string;
  fit_score: number;
  source: string;
  source_url: string;
  application_url: string;
  posted_at?: string;
  explanation: string[];
  description_text: string;
  raw_payload: Record<string, unknown>;
  normalized_payload: Record<string, unknown>;
};

export type AnswerRecord = {
  id: string;
  user_id?: string;
  question_type: string;
  normalized_question: string;
  company_context?: string;
  role_context?: string;
  answer_text: string;
  usage_count: number;
  last_used_at?: string;
};

export type ApplicationRecord = {
  id: string;
  user_id?: string;
  job_id: string;
  company: string;
  title: string;
  status: string;
  current_step: string;
  outcome?: string;
  notes: string;
};

export type RunRecord = {
  id: string;
  user_id?: string;
  run_type: string;
  status: string;
  started_at: string;
  finished_at?: string;
  summary: string;
};

export type AppData = {
  profile: ProfileRecord;
  sources: SourceRecord[];
  jobs: JobRecord[];
  answers: AnswerRecord[];
  applications: ApplicationRecord[];
  runs: RunRecord[];
};

export function createSeedData(): AppData {
  return {
    profile: {
      id: "profile_1",
      full_name: "Alex Candidate",
      email: "alex@example.com",
      location: "New York, NY",
      summary: "Product-minded software engineer focused on AI-enabled workflow tools.",
      resume_text: "",
      preferred_roles: ["Software Engineer", "Full Stack Engineer", "AI Product Engineer"],
      preferred_locations: ["New York, NY", "Remote"],
      preferred_companies: ["OpenAI", "Stripe", "Notion"],
      skills: ["Python", "TypeScript", "Next.js", "Automation", "LLMs"],
    },
    sources: [
      {
        id: "src_1",
        user_id: undefined,
        name: "AI Product Roles",
        type: "search_keyword",
        keywords: ["software engineer ai", "full stack engineer llm"],
        companies: ["OpenAI", "Anthropic"],
        roles: ["Software Engineer"],
        locations: ["Remote", "New York, NY"],
        workplace_modes: ["remote", "hybrid"],
        enabled: true,
        last_checked_at: new Date().toISOString(),
      },
    ],
    jobs: [],
    answers: [
      {
        id: "ans_1",
        user_id: undefined,
        question_type: "motivation",
        normalized_question: "why do you want to work here",
        company_context: undefined,
        role_context: undefined,
        answer_text:
          "I want to work on products where strong engineering directly improves how people make decisions.",
        usage_count: 8,
        last_used_at: new Date().toISOString(),
      },
    ],
    applications: [],
    runs: [],
  };
}

export function mapDbData(rows: {
  profiles: Array<Record<string, unknown>>;
  sources: Array<Record<string, unknown>>;
  jobs: Array<Record<string, unknown>>;
  answers: Array<Record<string, unknown>>;
  applications: Array<Record<string, unknown>>;
  runs: Array<Record<string, unknown>>;
}): AppData {
  const seed = createSeedData();
  const profileRow = rows.profiles[0];

  return {
    profile: profileRow
      ? {
          id: String(profileRow.id),
          user_id: profileRow.user_id ? String(profileRow.user_id) : undefined,
          full_name: String(profileRow.full_name),
          email: String(profileRow.email),
          location: String(profileRow.location),
          summary: String(profileRow.summary),
          resume_text: String(profileRow.resume_text),
          preferred_roles: (profileRow.preferred_roles as string[]) || [],
          preferred_locations: (profileRow.preferred_locations as string[]) || [],
          preferred_companies: (profileRow.preferred_companies as string[]) || [],
          skills: (profileRow.skills as string[]) || [],
        }
      : seed.profile,
    sources: rows.sources.map((row) => ({
      id: String(row.id),
      user_id: row.user_id ? String(row.user_id) : undefined,
      name: String(row.name),
      type: String(row.type),
      base_url: row.base_url ? String(row.base_url) : undefined,
      keywords: (row.keywords as string[]) || [],
      companies: (row.companies as string[]) || [],
      roles: (row.roles as string[]) || [],
      locations: (row.locations as string[]) || [],
      workplace_modes: (row.workplace_modes as string[]) || [],
      enabled: Boolean(row.enabled),
      last_checked_at: row.last_checked_at ? String(row.last_checked_at) : undefined,
    })),
    jobs: rows.jobs.map((row) => ({
      id: String(row.id),
      user_id: row.user_id ? String(row.user_id) : undefined,
      canonical_key: String(row.canonical_key),
      company: String(row.company),
      title: String(row.title),
      location: String(row.location),
      workplace_mode: String(row.workplace_mode),
      status: String(row.status),
      fit_score: Number(row.fit_score),
      source: String(row.source),
      source_url: String(row.source_url),
      application_url: String(row.application_url),
      posted_at: row.posted_at ? String(row.posted_at) : undefined,
      explanation: (row.explanation as string[]) || [],
      description_text: String(row.description_text),
      raw_payload: (row.raw_payload as Record<string, unknown>) || {},
      normalized_payload: (row.normalized_payload as Record<string, unknown>) || {},
    })),
    answers: rows.answers.map((row) => ({
      id: String(row.id),
      user_id: row.user_id ? String(row.user_id) : undefined,
      question_type: String(row.question_type),
      normalized_question: String(row.normalized_question),
      company_context: row.company_context ? String(row.company_context) : undefined,
      role_context: row.role_context ? String(row.role_context) : undefined,
      answer_text: String(row.answer_text),
      usage_count: Number(row.usage_count),
      last_used_at: row.last_used_at ? String(row.last_used_at) : undefined,
    })),
    applications: rows.applications.map((row) => ({
      id: String(row.id),
      user_id: row.user_id ? String(row.user_id) : undefined,
      job_id: String(row.job_id),
      company: String(row.company),
      title: String(row.title),
      status: String(row.status),
      current_step: String(row.current_step),
      outcome: row.outcome ? String(row.outcome) : undefined,
      notes: String(row.notes),
    })),
    runs: rows.runs.map((row) => ({
      id: String(row.id),
      user_id: row.user_id ? String(row.user_id) : undefined,
      run_type: String(row.run_type),
      status: String(row.status),
      started_at: String(row.started_at),
      finished_at: row.finished_at ? String(row.finished_at) : undefined,
      summary: String(row.summary),
    })),
  };
}

export function nextId(prefix: string, currentIds: string[]) {
  const numbers = currentIds
    .map((id) => Number(id.replace(`${prefix}_`, "")))
    .filter((value) => Number.isFinite(value));
  const next = numbers.length ? Math.max(...numbers) + 1 : 1;
  return `${prefix}_${next}`;
}
