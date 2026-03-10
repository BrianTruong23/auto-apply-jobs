import type { AnswerBankEntry, JobRecord, JobSource, RunLog } from "../types";

export const mockJobs: JobRecord[] = [
  {
    id: "job_1",
    company: "OpenAI",
    title: "Software Engineer, Applied AI",
    location: "San Francisco, CA",
    workplaceMode: "hybrid",
    status: "shortlisted",
    fitScore: 92,
    source: "Brave Search",
    sourceUrl: "https://example.com/jobs/openai-applied-ai",
    applicationUrl: "https://example.com/apply/openai-applied-ai",
    postedAt: "2026-03-08T00:00:00Z",
    explanation: ["Strong title match", "Preferred company", "AI workflow experience"],
  },
  {
    id: "job_2",
    company: "Stripe",
    title: "Full Stack Engineer, Growth",
    location: "Remote - US",
    workplaceMode: "remote",
    status: "discovered",
    fitScore: 84,
    source: "Manual URL",
    sourceUrl: "https://example.com/jobs/stripe-growth",
    applicationUrl: "https://example.com/apply/stripe-growth",
    postedAt: "2026-03-07T00:00:00Z",
    explanation: ["Remote preference match", "Strong full-stack overlap"],
  },
];

export const mockSources: JobSource[] = [
  {
    id: "src_1",
    name: "AI Product Roles",
    type: "search_keyword",
    keywords: ["software engineer ai", "full stack engineer llm"],
    companies: ["OpenAI", "Anthropic"],
    roles: ["Software Engineer"],
    locations: ["Remote", "New York, NY"],
    workplaceModes: ["remote", "hybrid"],
    enabled: true,
    lastCheckedAt: "2026-03-10T10:15:00Z",
  },
  {
    id: "src_2",
    name: "Stripe Careers",
    type: "company_page",
    baseUrl: "https://stripe.com/jobs/search",
    keywords: [],
    companies: ["Stripe"],
    roles: ["Backend Engineer"],
    locations: ["Remote"],
    workplaceModes: ["remote"],
    enabled: false,
  },
];

export const mockAnswers: AnswerBankEntry[] = [
  {
    id: "ans_1",
    questionType: "motivation",
    normalizedQuestion: "why do you want to work here",
    answerText: "I want to work on products where strong engineering directly improves how people make decisions.",
    usageCount: 8,
    lastUsedAt: "2026-03-09T14:00:00Z",
  },
  {
    id: "ans_2",
    questionType: "project_example",
    normalizedQuestion: "describe a project you are proud of",
    answerText: "I built workflow systems that combined structured data, automation, and review checkpoints.",
    usageCount: 5,
    lastUsedAt: "2026-03-05T12:00:00Z",
  },
];

export const mockRuns: RunLog[] = [
  {
    id: "run_1",
    runType: "discovery",
    status: "succeeded",
    startedAt: "2026-03-10T10:00:00Z",
    finishedAt: "2026-03-10T10:02:00Z",
    summary: "Brave discovery found 12 jobs, 4 new after deduplication.",
  },
  {
    id: "run_2",
    runType: "spreadsheet_sync",
    status: "partial",
    startedAt: "2026-03-10T10:05:00Z",
    finishedAt: "2026-03-10T10:05:20Z",
    summary: "Updated 9 rows; 1 row skipped due to missing spreadsheet mapping.",
  },
];
