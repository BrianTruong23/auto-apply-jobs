import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { Pool } from "pg";
import { createSeedData, mapDbData, nextId, type AppData } from "./store-shared";

const dataDir = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDir, "job-application-hub.json");
export type { AnswerRecord, AppData, ApplicationRecord, JobRecord, ProfileRecord, RunRecord, SourceRecord } from "./store-shared";

const connectionString = process.env.NEXT_CONNECTION_STRING || "";

let pool: Pool | null = null;
let dbReady: Promise<void> | null = null;

function getPool() {
  if (!connectionString) {
    return null;
  }

  if (!pool) {
    pool = new Pool({ connectionString });
  }
  return pool;
}

async function ensureDb() {
  const activePool = getPool();
  if (!activePool) {
    return;
  }

  if (!dbReady) {
    dbReady = (async () => {
      await activePool.query(`
        create table if not exists profiles (
          id text primary key,
          full_name text not null,
          email text not null,
          location text not null,
          summary text not null,
          resume_text text not null,
          preferred_roles jsonb not null,
          preferred_locations jsonb not null,
          preferred_companies jsonb not null,
          skills jsonb not null
        );

        create table if not exists job_sources (
          id text primary key,
          name text not null,
          type text not null,
          base_url text,
          keywords jsonb not null,
          companies jsonb not null,
          roles jsonb not null,
          locations jsonb not null,
          workplace_modes jsonb not null,
          enabled boolean not null,
          last_checked_at text
        );

        create table if not exists jobs (
          id text primary key,
          canonical_key text not null unique,
          company text not null,
          title text not null,
          location text not null,
          workplace_mode text not null,
          status text not null,
          fit_score double precision not null,
          source text not null,
          source_url text not null,
          application_url text not null,
          posted_at text,
          explanation jsonb not null,
          description_text text not null,
          raw_payload jsonb not null,
          normalized_payload jsonb not null
        );

        create table if not exists answers (
          id text primary key,
          question_type text not null,
          normalized_question text not null,
          answer_text text not null,
          usage_count integer not null,
          last_used_at text
        );

        create table if not exists applications (
          id text primary key,
          job_id text not null,
          company text not null,
          title text not null,
          status text not null,
          current_step text not null,
          outcome text,
          notes text not null
        );

        create table if not exists runs (
          id text primary key,
          run_type text not null,
          status text not null,
          started_at text not null,
          finished_at text,
          summary text not null
        );
      `);

      const profileCount = await activePool.query("select count(*)::int as count from profiles");
      if (profileCount.rows[0].count === 0) {
        await writeStoreToDb(createSeedData(), activePool);
      }
    })();
  }

  await dbReady;
}

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
  return JSON.parse(raw) as AppData;
}

async function writeFileStore(data: AppData): Promise<void> {
  await ensureFileStore();
  await writeFile(dataFile, JSON.stringify(data, null, 2), "utf8");
}

function jsonValue<T>(value: T) {
  return JSON.stringify(value);
}

export async function readStoreFromDb(activePool: Pool): Promise<AppData> {
  const [profiles, sources, jobs, answers, applications, runs] = await Promise.all([
    activePool.query("select * from profiles order by id asc"),
    activePool.query("select * from job_sources order by id desc"),
    activePool.query("select * from jobs order by fit_score desc, id desc"),
    activePool.query("select * from answers order by usage_count desc, id asc"),
    activePool.query("select * from applications order by id desc"),
    activePool.query("select * from runs order by started_at desc"),
  ]);

  return mapDbData({
    profiles: profiles.rows,
    sources: sources.rows,
    jobs: jobs.rows,
    answers: answers.rows,
    applications: applications.rows,
    runs: runs.rows,
  });
}

export async function writeStoreToDb(data: AppData, activePool: Pool): Promise<void> {
  const client = await activePool.connect();
  try {
    await client.query("begin");
    await client.query("delete from profiles");
    await client.query("delete from job_sources");
    await client.query("delete from jobs");
    await client.query("delete from answers");
    await client.query("delete from applications");
    await client.query("delete from runs");

    await client.query(
      `insert into profiles (
        id, full_name, email, location, summary, resume_text,
        preferred_roles, preferred_locations, preferred_companies, skills
      ) values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9::jsonb,$10::jsonb)`,
      [
        data.profile.id,
        data.profile.full_name,
        data.profile.email,
        data.profile.location,
        data.profile.summary,
        data.profile.resume_text,
        jsonValue(data.profile.preferred_roles),
        jsonValue(data.profile.preferred_locations),
        jsonValue(data.profile.preferred_companies),
        jsonValue(data.profile.skills),
      ],
    );

    for (const source of data.sources) {
      await client.query(
        `insert into job_sources (
          id, name, type, base_url, keywords, companies, roles, locations, workplace_modes, enabled, last_checked_at
        ) values ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7::jsonb,$8::jsonb,$9::jsonb,$10,$11)`,
        [
          source.id,
          source.name,
          source.type,
          source.base_url || null,
          jsonValue(source.keywords),
          jsonValue(source.companies),
          jsonValue(source.roles),
          jsonValue(source.locations),
          jsonValue(source.workplace_modes),
          source.enabled,
          source.last_checked_at || null,
        ],
      );
    }

    for (const job of data.jobs) {
      await client.query(
        `insert into jobs (
          id, canonical_key, company, title, location, workplace_mode, status, fit_score, source,
          source_url, application_url, posted_at, explanation, description_text, raw_payload, normalized_payload
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14,$15::jsonb,$16::jsonb)`,
        [
          job.id,
          job.canonical_key,
          job.company,
          job.title,
          job.location,
          job.workplace_mode,
          job.status,
          job.fit_score,
          job.source,
          job.source_url,
          job.application_url,
          job.posted_at || null,
          jsonValue(job.explanation),
          job.description_text,
          jsonValue(job.raw_payload),
          jsonValue(job.normalized_payload),
        ],
      );
    }

    for (const answer of data.answers) {
      await client.query(
        `insert into answers (
          id, question_type, normalized_question, answer_text, usage_count, last_used_at
        ) values ($1,$2,$3,$4,$5,$6)`,
        [
          answer.id,
          answer.question_type,
          answer.normalized_question,
          answer.answer_text,
          answer.usage_count,
          answer.last_used_at || null,
        ],
      );
    }

    for (const application of data.applications) {
      await client.query(
        `insert into applications (
          id, job_id, company, title, status, current_step, outcome, notes
        ) values ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          application.id,
          application.job_id,
          application.company,
          application.title,
          application.status,
          application.current_step,
          application.outcome || null,
          application.notes,
        ],
      );
    }

    for (const run of data.runs) {
      await client.query(
        `insert into runs (
          id, run_type, status, started_at, finished_at, summary
        ) values ($1,$2,$3,$4,$5,$6)`,
        [run.id, run.run_type, run.status, run.started_at, run.finished_at || null, run.summary],
      );
    }

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function readStore(): Promise<AppData> {
  const activePool = getPool();
  if (activePool) {
    await ensureDb();
    return readStoreFromDb(activePool);
  }

  return readFileStore();
}

export async function writeStore(data: AppData): Promise<void> {
  const activePool = getPool();
  if (activePool) {
    await ensureDb();
    await writeStoreToDb(data, activePool);
    return;
  }

  await writeFileStore(data);
}
export { nextId };
