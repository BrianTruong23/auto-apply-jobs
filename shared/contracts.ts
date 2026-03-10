export type JobStatus =
  | "discovered"
  | "shortlisted"
  | "preparing"
  | "applying"
  | "submitted"
  | "rejected"
  | "interview"
  | "offer"
  | "archived";

export type RunStatus = "queued" | "running" | "succeeded" | "failed" | "partial";

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  location: string;
  summary: string;
  preferredRoles: string[];
  preferredLocations: string[];
  preferredCompanies: string[];
  skills: string[];
}

export interface JobSource {
  id: string;
  name: string;
  type: string;
  baseUrl?: string;
  keywords: string[];
  companies: string[];
  roles: string[];
  locations: string[];
  workplaceModes: string[];
  enabled: boolean;
  lastCheckedAt?: string;
}

export interface JobRecord {
  id: string;
  company: string;
  title: string;
  location: string;
  workplaceMode: string;
  status: JobStatus;
  fitScore: number;
  source: string;
  sourceUrl: string;
  applicationUrl: string;
  postedAt?: string;
  explanation: string[];
}

export interface AnswerBankEntry {
  id: string;
  questionType: string;
  normalizedQuestion: string;
  answerText: string;
  usageCount: number;
  lastUsedAt?: string;
}

export interface RunLog {
  id: string;
  runType: string;
  status: RunStatus;
  startedAt: string;
  finishedAt?: string;
  summary: string;
}
