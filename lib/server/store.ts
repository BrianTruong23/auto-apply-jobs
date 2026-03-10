import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type ProfileRecord = {
  id: string;
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

type SourceRecord = {
  id: string;
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

type JobRecord = {
  id: string;
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

type AnswerRecord = {
  id: string;
  question_type: string;
  normalized_question: string;
  answer_text: string;
  usage_count: number;
  last_used_at?: string;
};

type ApplicationRecord = {
  id: string;
  job_id: string;
  company: string;
  title: string;
  status: string;
  current_step: string;
  outcome?: string;
  notes: string;
};

type RunRecord = {
  id: string;
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

const dataDir = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDir, "job-application-hub.json");

const seedData: AppData = {
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
      question_type: "motivation",
      normalized_question: "why do you want to work here",
      answer_text:
        "I want to work on products where strong engineering directly improves how people make decisions.",
      usage_count: 8,
      last_used_at: new Date().toISOString(),
    },
  ],
  applications: [],
  runs: [],
};

async function ensureStore() {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(dataFile, "utf8");
  } catch {
    await writeFile(dataFile, JSON.stringify(seedData, null, 2), "utf8");
  }
}

export async function readStore(): Promise<AppData> {
  await ensureStore();
  const raw = await readFile(dataFile, "utf8");
  return JSON.parse(raw) as AppData;
}

export async function writeStore(data: AppData): Promise<void> {
  await ensureStore();
  await writeFile(dataFile, JSON.stringify(data, null, 2), "utf8");
}

export function nextId(prefix: string, currentIds: string[]) {
  const numbers = currentIds
    .map((id) => Number(id.replace(`${prefix}_`, "")))
    .filter((value) => Number.isFinite(value));
  const next = numbers.length ? Math.max(...numbers) + 1 : 1;
  return `${prefix}_${next}`;
}
