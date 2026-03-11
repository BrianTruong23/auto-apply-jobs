import {
  createSeedData,
  nextId,
  type AnswerRecord,
  type ApplicationRecord,
  type JobRecord,
  type ProfileRecord,
  type RunRecord,
  type SourceRecord,
} from "./store-shared";
import { insertRow, isServerSupabaseConfigured, selectMany, selectOne, upsertRow, updateRow } from "./supabase-server";
import { readStore, writeStore } from "./store";

export async function getProfileRecord() {
  if (!isServerSupabaseConfigured()) {
    return (await readStore()).profile;
  }

  return selectOne<ProfileRecord>("Loading profile", "profiles", "select=*&order=id.asc&limit=1");
}

export async function upsertProfileRecord(profile: ProfileRecord) {
  if (!isServerSupabaseConfigured()) {
    const data = await readStore();
    data.profile = profile;
    await writeStore(data);
    return profile;
  }

  return (await upsertRow<ProfileRecord>("Saving profile", "profiles", profile, "id")) as ProfileRecord;
}

export async function listSourceRecords() {
  if (!isServerSupabaseConfigured()) {
    return (await readStore()).sources;
  }

  return selectMany<SourceRecord>("Loading job sources", "job_sources", "select=*&order=id.desc");
}

export async function createSourceRecord(source: SourceRecord) {
  if (!isServerSupabaseConfigured()) {
    const data = await readStore();
    data.sources.unshift(source);
    await writeStore(data);
    return source;
  }

  return (await insertRow<SourceRecord>("Creating job source", "job_sources", source)) as SourceRecord;
}

export async function listJobRecords() {
  if (!isServerSupabaseConfigured()) {
    return (await readStore()).jobs;
  }

  return selectMany<JobRecord>("Loading jobs", "jobs", "select=*&order=fit_score.desc,id.desc");
}

export async function getJobRecord(jobId: string) {
  if (!isServerSupabaseConfigured()) {
    return (await readStore()).jobs.find((item) => item.id === jobId) || null;
  }

  return selectOne<JobRecord>("Loading job", "jobs", `select=*&id=eq.${encodeURIComponent(jobId)}&limit=1`);
}

export async function upsertJobRecord(job: JobRecord) {
  if (!isServerSupabaseConfigured()) {
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

  const existingRow = await selectOne<{ id: string }>(
    "Checking existing job",
    "jobs",
    `select=id&canonical_key=eq.${encodeURIComponent(job.canonical_key)}&limit=1`,
  );
  const result = await upsertRow<JobRecord>("Saving job", "jobs", job, "canonical_key");
  return {
    job: result as JobRecord,
    created: !existingRow,
  };
}

export async function listAnswerRecords() {
  if (!isServerSupabaseConfigured()) {
    return (await readStore()).answers;
  }

  return selectMany<AnswerRecord>("Loading answers", "answers", "select=*&order=usage_count.desc,id.asc");
}

export async function createAnswerRecord(answer: AnswerRecord) {
  if (!isServerSupabaseConfigured()) {
    const data = await readStore();
    data.answers.unshift(answer);
    await writeStore(data);
    return answer;
  }

  return (await insertRow<AnswerRecord>("Creating answer bank entry", "answers", answer)) as AnswerRecord;
}

export async function incrementAnswerUsage(answerId: string) {
  if (!isServerSupabaseConfigured()) {
    const data = await readStore();
    const answer = data.answers.find((item) => item.id === answerId);
    if (!answer) return null;
    answer.usage_count += 1;
    answer.last_used_at = new Date().toISOString();
    await writeStore(data);
    return answer;
  }

  const row = await selectOne<AnswerRecord>(
    "Loading answer usage",
    "answers",
    `select=*&id=eq.${encodeURIComponent(answerId)}&limit=1`,
  );
  if (!row) {
    return null;
  }

  const next = {
    ...row,
    usage_count: Number(row.usage_count) + 1,
    last_used_at: new Date().toISOString(),
  };
  return updateRow<AnswerRecord>(
    "Updating answer usage",
    "answers",
    `id=eq.${encodeURIComponent(answerId)}`,
    next,
  );
}

export async function listApplicationRecords() {
  if (!isServerSupabaseConfigured()) {
    return (await readStore()).applications;
  }

  return selectMany<ApplicationRecord>("Loading applications", "applications", "select=*&order=id.desc");
}

export async function createApplicationDbRecord(record: ApplicationRecord) {
  if (!isServerSupabaseConfigured()) {
    const data = await readStore();
    data.applications.unshift(record);
    await writeStore(data);
    return record;
  }

  return (await insertRow<ApplicationRecord>("Creating application", "applications", record)) as ApplicationRecord;
}

export async function updateApplicationDbRecord(record: ApplicationRecord) {
  if (!isServerSupabaseConfigured()) {
    const data = await readStore();
    const existing = data.applications.find((item) => item.id === record.id);
    if (!existing) return null;
    Object.assign(existing, record);
    await writeStore(data);
    return existing;
  }

  return updateRow<ApplicationRecord>(
    "Updating application",
    "applications",
    `id=eq.${encodeURIComponent(record.id)}`,
    record,
  );
}

export async function getApplicationRecord(applicationId: string) {
  if (!isServerSupabaseConfigured()) {
    return (await readStore()).applications.find((item) => item.id === applicationId) || null;
  }

  return selectOne<ApplicationRecord>(
    "Loading application",
    "applications",
    `select=*&id=eq.${encodeURIComponent(applicationId)}&limit=1`,
  );
}

export async function listRunRecords() {
  if (!isServerSupabaseConfigured()) {
    return (await readStore()).runs;
  }

  return selectMany<RunRecord>("Loading runs", "runs", "select=*&order=started_at.desc");
}

export async function createRunRecord(run: RunRecord) {
  if (!isServerSupabaseConfigured()) {
    const data = await readStore();
    data.runs.unshift(run);
    await writeStore(data);
    return run;
  }

  return (await insertRow<RunRecord>("Creating run log", "runs", run)) as RunRecord;
}

export async function ensureSeedData() {
  if (!isServerSupabaseConfigured()) {
    await readStore();
    return;
  }

  const existingProfile = await selectOne<{ id: string }>("Checking seed profile", "profiles", "select=id&limit=1");
  if (existingProfile) {
    return;
  }

  const seed = createSeedData();
  await upsertProfileRecord(seed.profile);
  for (const source of seed.sources) {
    await createSourceRecord(source);
  }
  for (const answer of seed.answers) {
    await createAnswerRecord(answer);
  }
}

export async function allocateId(prefix: string) {
  const data = await readStore();
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
