import { randomUUID } from "node:crypto";

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

export async function getProfileRecord(userId: string) {
  if (!isServerSupabaseConfigured()) {
    return (await readStore()).profile;
  }

  return selectOne<ProfileRecord>(
    "Loading profile",
    "profiles",
    `select=*&user_id=eq.${encodeURIComponent(userId)}&limit=1`,
  );
}

export async function upsertProfileRecord(userId: string, profile: ProfileRecord) {
  if (!isServerSupabaseConfigured()) {
    const data = await readStore();
    data.profile = profile;
    await writeStore(data);
    return profile;
  }

  return (await upsertRow<ProfileRecord>("Saving profile", "profiles", { ...profile, user_id: userId }, "user_id")) as ProfileRecord;
}

export async function listSourceRecords(userId: string) {
  if (!isServerSupabaseConfigured()) {
    return (await readStore()).sources;
  }

  return selectMany<SourceRecord>(
    "Loading job sources",
    "job_sources",
    `select=*&user_id=eq.${encodeURIComponent(userId)}&order=id.desc`,
  );
}

export async function createSourceRecord(userId: string, source: SourceRecord) {
  if (!isServerSupabaseConfigured()) {
    const data = await readStore();
    data.sources.unshift(source);
    await writeStore(data);
    return source;
  }

  return (await insertRow<SourceRecord>("Creating job source", "job_sources", { ...source, user_id: userId })) as SourceRecord;
}

export async function listJobRecords(userId: string) {
  if (!isServerSupabaseConfigured()) {
    return (await readStore()).jobs;
  }

  return selectMany<JobRecord>(
    "Loading jobs",
    "jobs",
    `select=*&user_id=eq.${encodeURIComponent(userId)}&order=fit_score.desc,id.desc`,
  );
}

export async function getJobRecord(userId: string, jobId: string) {
  if (!isServerSupabaseConfigured()) {
    return (await readStore()).jobs.find((item) => item.id === jobId) || null;
  }

  return selectOne<JobRecord>(
    "Loading job",
    "jobs",
    `select=*&id=eq.${encodeURIComponent(jobId)}&user_id=eq.${encodeURIComponent(userId)}&limit=1`,
  );
}

export async function upsertJobRecord(userId: string, job: JobRecord) {
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
    `select=id&canonical_key=eq.${encodeURIComponent(job.canonical_key)}&user_id=eq.${encodeURIComponent(userId)}&limit=1`,
  );
  const result = await upsertRow<JobRecord>("Saving job", "jobs", { ...job, user_id: userId }, "user_id,canonical_key");
  return {
    job: result as JobRecord,
    created: !existingRow,
  };
}

export async function listAnswerRecords(userId: string) {
  if (!isServerSupabaseConfigured()) {
    return (await readStore()).answers;
  }

  return selectMany<AnswerRecord>(
    "Loading answers",
    "answers",
    `select=*&user_id=eq.${encodeURIComponent(userId)}&order=usage_count.desc,id.asc`,
  );
}

export async function createAnswerRecord(userId: string, answer: AnswerRecord) {
  if (!isServerSupabaseConfigured()) {
    const data = await readStore();
    data.answers.unshift(answer);
    await writeStore(data);
    return answer;
  }

  return (await insertRow<AnswerRecord>("Creating answer bank entry", "answers", { ...answer, user_id: userId })) as AnswerRecord;
}

export async function incrementAnswerUsage(userId: string, answerId: string) {
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
    `select=*&id=eq.${encodeURIComponent(answerId)}&user_id=eq.${encodeURIComponent(userId)}&limit=1`,
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
    `id=eq.${encodeURIComponent(answerId)}&user_id=eq.${encodeURIComponent(userId)}`,
    { ...next, user_id: userId },
  );
}

export async function listApplicationRecords(userId: string) {
  if (!isServerSupabaseConfigured()) {
    return (await readStore()).applications;
  }

  return selectMany<ApplicationRecord>(
    "Loading applications",
    "applications",
    `select=*&user_id=eq.${encodeURIComponent(userId)}&order=id.desc`,
  );
}

export async function createApplicationDbRecord(userId: string, record: ApplicationRecord) {
  if (!isServerSupabaseConfigured()) {
    const data = await readStore();
    data.applications.unshift(record);
    await writeStore(data);
    return record;
  }

  return (await insertRow<ApplicationRecord>("Creating application", "applications", { ...record, user_id: userId })) as ApplicationRecord;
}

export async function updateApplicationDbRecord(userId: string, record: ApplicationRecord) {
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
    `id=eq.${encodeURIComponent(record.id)}&user_id=eq.${encodeURIComponent(userId)}`,
    { ...record, user_id: userId },
  );
}

export async function getApplicationRecord(userId: string, applicationId: string) {
  if (!isServerSupabaseConfigured()) {
    return (await readStore()).applications.find((item) => item.id === applicationId) || null;
  }

  return selectOne<ApplicationRecord>(
    "Loading application",
    "applications",
    `select=*&id=eq.${encodeURIComponent(applicationId)}&user_id=eq.${encodeURIComponent(userId)}&limit=1`,
  );
}

export async function listRunRecords(userId: string) {
  if (!isServerSupabaseConfigured()) {
    return (await readStore()).runs;
  }

  return selectMany<RunRecord>(
    "Loading runs",
    "runs",
    `select=*&user_id=eq.${encodeURIComponent(userId)}&order=started_at.desc`,
  );
}

export async function createRunRecord(userId: string, run: RunRecord) {
  if (!isServerSupabaseConfigured()) {
    const data = await readStore();
    data.runs.unshift(run);
    await writeStore(data);
    return run;
  }

  return (await insertRow<RunRecord>("Creating run log", "runs", { ...run, user_id: userId })) as RunRecord;
}

export async function ensureSeedData(userId: string) {
  if (!isServerSupabaseConfigured()) {
    await readStore();
    return;
  }

  const existingProfile = await selectOne<{ id: string }>(
    "Checking seed profile",
    "profiles",
    `select=id&user_id=eq.${encodeURIComponent(userId)}&limit=1`,
  );
  if (existingProfile) {
    return;
  }

  const seed = createSeedData();
  await upsertProfileRecord(userId, { ...seed.profile, user_id: userId });
  for (const source of seed.sources) {
    await createSourceRecord(userId, { ...source, user_id: userId });
  }
  for (const answer of seed.answers) {
    await createAnswerRecord(userId, { ...answer, user_id: userId });
  }
}

export async function allocateId(userId: string, prefix: string) {
  if (isServerSupabaseConfigured()) {
    return `${prefix}_${randomUUID().slice(0, 8)}`;
  }

  const data = isServerSupabaseConfigured()
    ? {
        profile: (await getProfileRecord(userId)) || createSeedData().profile,
        sources: await listSourceRecords(userId),
        jobs: await listJobRecords(userId),
        answers: await listAnswerRecords(userId),
        applications: await listApplicationRecords(userId),
        runs: await listRunRecords(userId),
      }
    : await readStore();
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
