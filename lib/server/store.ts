import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { isServerSupabaseConfigured, selectMany } from "./supabase-server";
import { createSeedData, mapDbData, type AppData } from "./store-shared";

const dataDir = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDir, "job-application-hub.json");

export type {
  AnswerRecord,
  AppData,
  ApplicationRecord,
  JobRecord,
  ProfileRecord,
  RunRecord,
  SourceRecord,
} from "./store-shared";

async function ensureFileStore() {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(dataFile, "utf8");
  } catch {
    await writeFile(dataFile, JSON.stringify(createSeedData(), null, 2), "utf8");
  }
}

async function readFileStore(): Promise<AppData> {
  await ensureFileStore();
  const raw = await readFile(dataFile, "utf8");
  try {
    return JSON.parse(raw) as AppData;
  } catch {
    const seed = createSeedData();
    await writeFile(dataFile, JSON.stringify(seed, null, 2), "utf8");
    return seed;
  }
}

async function writeFileStore(data: AppData): Promise<void> {
  await ensureFileStore();
  await writeFile(dataFile, JSON.stringify(data, null, 2), "utf8");
}

export async function readStoreFromSupabase(): Promise<AppData> {
  const [profiles, sources, jobs, answers, applications, runs] = await Promise.all([
    selectMany<Record<string, unknown>>("Loading profiles", "profiles", "select=*&order=id.asc"),
    selectMany<Record<string, unknown>>("Loading job sources", "job_sources", "select=*&order=id.desc"),
    selectMany<Record<string, unknown>>("Loading jobs", "jobs", "select=*&order=fit_score.desc,id.desc"),
    selectMany<Record<string, unknown>>("Loading answers", "answers", "select=*&order=usage_count.desc,id.asc"),
    selectMany<Record<string, unknown>>("Loading applications", "applications", "select=*&order=id.desc"),
    selectMany<Record<string, unknown>>("Loading runs", "runs", "select=*&order=started_at.desc"),
  ]);

  return mapDbData({
    profiles,
    sources,
    jobs,
    answers,
    applications,
    runs,
  });
}

export async function readStore(): Promise<AppData> {
  if (isServerSupabaseConfigured()) {
    return readStoreFromSupabase();
  }

  return readFileStore();
}

export async function writeStore(data: AppData): Promise<void> {
  if (isServerSupabaseConfigured()) {
    throw new Error(
      "writeStore cannot replace the entire Supabase dataset. Use repository helpers so writes stay table-scoped.",
    );
  }

  await writeFileStore(data);
}
