import type { ApplicationRecord, AppData, JobRecord } from "./store-shared";

export function getJobDetail(data: AppData, jobId: string) {
  const job = data.jobs.find((item) => item.id === jobId);
  if (!job) {
    return null;
  }

  const applications = data.applications.filter((item) => item.job_id === jobId);
  return {
    job,
    applications,
    latestApplication: applications[0] || null,
  };
}

export function createApplicationRecord(input: {
  id: string;
  job: JobRecord;
  status?: string;
  current_step?: string;
  outcome?: string;
  notes?: string;
}): ApplicationRecord {
  return {
    id: input.id,
    job_id: input.job.id,
    company: input.job.company,
    title: input.job.title,
    status: input.status || "preparing",
    current_step: input.current_step || "",
    outcome: input.outcome || undefined,
    notes: input.notes || "",
  };
}

export function updateApplicationRecord(
  current: ApplicationRecord,
  updates: {
    status?: string;
    current_step?: string;
    outcome?: string;
    notes?: string;
  },
): ApplicationRecord {
  return {
    ...current,
    status: updates.status ?? current.status,
    current_step: updates.current_step ?? current.current_step,
    outcome: updates.outcome ?? current.outcome,
    notes: updates.notes ?? current.notes,
  };
}
