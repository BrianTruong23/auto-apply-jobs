import Link from "next/link";
import { notFound } from "next/navigation";

import { ApplicationManager } from "@/components/application-manager";
import { getJobRecord, listApplicationRecords } from "@/lib/server/repository";
import type { ApplicationRecord, JobRecord } from "@/types";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [jobRow, applicationRows] = await Promise.all([getJobRecord(id), listApplicationRecords()]);
  if (!jobRow) {
    notFound();
  }

  const job: JobRecord = {
    id: jobRow.id,
    canonicalKey: jobRow.canonical_key,
    company: jobRow.company,
    title: jobRow.title,
    location: jobRow.location,
    workplaceMode: jobRow.workplace_mode,
    status: jobRow.status as JobRecord["status"],
    fitScore: jobRow.fit_score,
    source: jobRow.source,
    sourceUrl: jobRow.source_url,
    applicationUrl: jobRow.application_url,
    postedAt: jobRow.posted_at,
    explanation: jobRow.explanation,
    descriptionText: jobRow.description_text,
  };
  const applications: ApplicationRecord[] = applicationRows.filter((item) => item.job_id === id).map((item) => ({
    id: item.id,
    jobId: item.job_id,
    company: item.company,
    title: item.title,
    status: item.status,
    currentStep: item.current_step,
    outcome: item.outcome,
    notes: item.notes,
  }));

  return (
    <main className="page">
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Job detail</p>
            <h1>{job.title}</h1>
            <p>{job.company} - {job.location}</p>
          </div>
          <Link className="button-secondary" href="/jobs">
            Back to jobs
          </Link>
        </div>
        <div className="detail-grid">
          <article className="answer-card">
            <strong>Fit score</strong>
            <p>{Math.round(job.fitScore)}</p>
            <p className="muted">{job.explanation.join(" - ")}</p>
          </article>
          <article className="answer-card">
            <strong>Source</strong>
            <p>{job.source}</p>
            <p className="muted">{job.sourceUrl}</p>
          </article>
          <article className="answer-card detail-full">
            <strong>Description</strong>
            <p>{job.descriptionText || "No description captured yet."}</p>
          </article>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Applications</h2>
          <p>Create and update application tracking directly from the job detail page.</p>
        </div>
        <ApplicationManager job={job} initialApplications={applications} />
      </section>
    </main>
  );
}
