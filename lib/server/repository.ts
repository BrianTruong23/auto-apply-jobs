import type { Pool } from "pg";

import { createSeedData, nextId, type AnswerRecord, type ApplicationRecord, type JobRecord, type ProfileRecord, type RunRecord, type SourceRecord } from "./store-shared";
import { ensureDb, getDbPool, readStore, readStoreFromDb, writeStore } from "./store";

function jsonValue<T>(value: T) {
  return JSON.stringify(value);
}

async function dbData(pool: Pool) {
  await ensureDb();
  return readStoreFromDb(pool);
}

export async function getProfileRecord() {
  const pool = getDbPool();
  if (!pool) {
    return (await readStore()).profile;
  }
  const rows = await pool.query("select * from profiles order by id asc limit 1");
  return rows.rows[0] as ProfileRecord;
}

export async function upsertProfileRecord(profile: ProfileRecord) {
  const pool = getDbPool();
  if (!pool) {
    const data = await readStore();
    data.profile = profile;
    await writeStore(data);
    return profile;
  }
  await ensureDb();
  await pool.query(
    `insert into profiles (
      id, full_name, email, location, summary, resume_text, preferred_roles, preferred_locations, preferred_companies, skills
    ) values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9::jsonb,$10::jsonb)
    on conflict (id) do update set
      full_name = excluded.full_name,
      email = excluded.email,
      location = excluded.location,
      summary = excluded.summary,
      resume_text = excluded.resume_text,
      preferred_roles = excluded.preferred_roles,
      preferred_locations = excluded.preferred_locations,
      preferred_companies = excluded.preferred_companies,
      skills = excluded.skills`,
    [
      profile.id,
      profile.full_name,
      profile.email,
      profile.location,
      profile.summary,
      profile.resume_text,
      jsonValue(profile.preferred_roles),
      jsonValue(profile.preferred_locations),
      jsonValue(profile.preferred_companies),
      jsonValue(profile.skills),
    ],
  );
  return profile;
}

export async function listSourceRecords() {
  const pool = getDbPool();
  if (!pool) {
    return (await readStore()).sources;
  }
  const rows = await pool.query("select * from job_sources order by id desc");
  return rows.rows as SourceRecord[];
}

export async function createSourceRecord(source: SourceRecord) {
  const pool = getDbPool();
  if (!pool) {
    const data = await readStore();
    data.sources.unshift(source);
    await writeStore(data);
    return source;
  }
  await ensureDb();
  await pool.query(
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
  return source;
}

export async function listJobRecords() {
  const pool = getDbPool();
  if (!pool) {
    return (await readStore()).jobs;
  }
  const rows = await pool.query("select * from jobs order by fit_score desc, id desc");
  return rows.rows as JobRecord[];
}

export async function getJobRecord(jobId: string) {
  const pool = getDbPool();
  if (!pool) {
    return (await readStore()).jobs.find((item) => item.id === jobId) || null;
  }
  const rows = await pool.query("select * from jobs where id = $1 limit 1", [jobId]);
  return (rows.rows[0] as JobRecord | undefined) || null;
}

export async function upsertJobRecord(job: JobRecord) {
  const pool = getDbPool();
  if (!pool) {
    const data = await readStore();
    const existing = data.jobs.find((item) => item.canonical_key === job.canonical_key);
    if (existing) {
      Object.assign(existing, job);
    } else {
      data.jobs.unshift(job);
    }
    await writeStore(data);
    return { job, created: !existing };
  }
  await ensureDb();
  const existing = await pool.query("select id from jobs where canonical_key = $1 limit 1", [job.canonical_key]);
  await pool.query(
    `insert into jobs (
      id, canonical_key, company, title, location, workplace_mode, status, fit_score, source, source_url,
      application_url, posted_at, explanation, description_text, raw_payload, normalized_payload
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14,$15::jsonb,$16::jsonb)
    on conflict (canonical_key) do update set
      company = excluded.company,
      title = excluded.title,
      location = excluded.location,
      workplace_mode = excluded.workplace_mode,
      status = excluded.status,
      fit_score = excluded.fit_score,
      source = excluded.source,
      source_url = excluded.source_url,
      application_url = excluded.application_url,
      posted_at = excluded.posted_at,
      explanation = excluded.explanation,
      description_text = excluded.description_text,
      raw_payload = excluded.raw_payload,
      normalized_payload = excluded.normalized_payload`,
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
  return { job, created: existing.rowCount === 0 };
}

export async function listAnswerRecords() {
  const pool = getDbPool();
  if (!pool) {
    return (await readStore()).answers;
  }
  const rows = await pool.query("select * from answers order by usage_count desc, id asc");
  return rows.rows as AnswerRecord[];
}

export async function createAnswerRecord(answer: AnswerRecord) {
  const pool = getDbPool();
  if (!pool) {
    const data = await readStore();
    data.answers.unshift(answer);
    await writeStore(data);
    return answer;
  }
  await ensureDb();
  await pool.query(
    "insert into answers (id, question_type, normalized_question, answer_text, usage_count, last_used_at) values ($1,$2,$3,$4,$5,$6)",
    [answer.id, answer.question_type, answer.normalized_question, answer.answer_text, answer.usage_count, answer.last_used_at || null],
  );
  return answer;
}

export async function incrementAnswerUsage(answerId: string) {
  const pool = getDbPool();
  const now = new Date().toISOString();
  if (!pool) {
    const data = await readStore();
    const answer = data.answers.find((item) => item.id === answerId);
    if (!answer) return null;
    answer.usage_count += 1;
    answer.last_used_at = now;
    await writeStore(data);
    return answer;
  }
  await ensureDb();
  const result = await pool.query(
    "update answers set usage_count = usage_count + 1, last_used_at = $2 where id = $1 returning *",
    [answerId, now],
  );
  return (result.rows[0] as AnswerRecord | undefined) || null;
}

export async function listApplicationRecords() {
  const pool = getDbPool();
  if (!pool) {
    return (await readStore()).applications;
  }
  const rows = await pool.query("select * from applications order by id desc");
  return rows.rows as ApplicationRecord[];
}

export async function createApplicationDbRecord(record: ApplicationRecord) {
  const pool = getDbPool();
  if (!pool) {
    const data = await readStore();
    data.applications.unshift(record);
    await writeStore(data);
    return record;
  }
  await ensureDb();
  await pool.query(
    "insert into applications (id, job_id, company, title, status, current_step, outcome, notes) values ($1,$2,$3,$4,$5,$6,$7,$8)",
    [record.id, record.job_id, record.company, record.title, record.status, record.current_step, record.outcome || null, record.notes],
  );
  return record;
}

export async function updateApplicationDbRecord(record: ApplicationRecord) {
  const pool = getDbPool();
  if (!pool) {
    const data = await readStore();
    const existing = data.applications.find((item) => item.id === record.id);
    if (!existing) return null;
    Object.assign(existing, record);
    await writeStore(data);
    return existing;
  }
  await ensureDb();
  const result = await pool.query(
    `update applications
      set status = $2, current_step = $3, outcome = $4, notes = $5
      where id = $1
      returning *`,
    [record.id, record.status, record.current_step, record.outcome || null, record.notes],
  );
  return (result.rows[0] as ApplicationRecord | undefined) || null;
}

export async function getApplicationRecord(applicationId: string) {
  const pool = getDbPool();
  if (!pool) {
    return (await readStore()).applications.find((item) => item.id === applicationId) || null;
  }
  const rows = await pool.query("select * from applications where id = $1 limit 1", [applicationId]);
  return (rows.rows[0] as ApplicationRecord | undefined) || null;
}

export async function listRunRecords() {
  const pool = getDbPool();
  if (!pool) {
    return (await readStore()).runs;
  }
  const rows = await pool.query("select * from runs order by started_at desc");
  return rows.rows as RunRecord[];
}

export async function createRunRecord(run: RunRecord) {
  const pool = getDbPool();
  if (!pool) {
    const data = await readStore();
    data.runs.unshift(run);
    await writeStore(data);
    return run;
  }
  await ensureDb();
  await pool.query(
    "insert into runs (id, run_type, status, started_at, finished_at, summary) values ($1,$2,$3,$4,$5,$6)",
    [run.id, run.run_type, run.status, run.started_at, run.finished_at || null, run.summary],
  );
  return run;
}

export async function ensureSeedData() {
  const pool = getDbPool();
  if (!pool) return;
  await ensureDb();
  const rows = await pool.query("select count(*)::int as count from profiles");
  if (rows.rows[0].count > 0) return;
  const seed = createSeedData();
  await upsertProfileRecord(seed.profile);
  for (const source of seed.sources) await createSourceRecord(source);
  for (const answer of seed.answers) await createAnswerRecord(answer);
}

export async function allocateId(prefix: string) {
  const data = getDbPool() ? await dbData(getDbPool()!) : await readStore();
  switch (prefix) {
    case "src":
      return nextId(prefix, data.sources.map((item) => item.id));
    case "job":
      return nextId(prefix, data.jobs.map((item) => item.id));
    case "ans":
      return nextId(prefix, data.answers.map((item) => item.id));
    case "app":
      return nextId(prefix, data.applications.map((item) => item.id));
    case "run":
      return nextId(prefix, data.runs.map((item) => item.id));
    default:
      return nextId(prefix, []);
  }
}
