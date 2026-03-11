import Link from "next/link";
import { notFound } from "next/navigation";

import { ApplicationManager } from "@/components/application-manager";
import { AuthRequired } from "@/components/auth-required";
import { isAuthenticated } from "@/lib/api";
import { getServerViewer } from "@/lib/server/auth";
import { getJobRecord, listApplicationRecords } from "@/lib/server/repository";
import type { ApplicationRecord, JobRecord } from "@/types";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return <AuthRequired title="Log in to view job details" />;
  }

  const viewer = await getServerViewer();
  if (!viewer) {
    return <AuthRequired title="Log in to view job details" />;
  }

  const { id } = await params;
  const [jobRow, applicationRows] = await Promise.all([getJobRecord(viewer.id, id), listApplicationRecords(viewer.id)]);
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
      <section className="page-header">
        <div>
          <p className="eyebrow">Job detail</p>
          <h1>{job.title}</h1>
          <p>{job.company} - {job.location}</p>
        </div>
        <Link className="button-secondary" href="/jobs">
          Back to jobs
        </Link>
      </section>

      <section className="detail-layout">
        <div className="stack-lg">
          <div className="surface">
            <div className="panel-header">
              <div>
                <h2>Role snapshot</h2>
                <p>Evaluate provenance, fit quality, and job context before moving into active application work.</p>
              </div>
              <span className={`badge badge-${job.status}`}>{job.status}</span>
            </div>
            <div className="detail-grid">
              <article className="mini-panel">
                <strong>Fit score</strong>
                <p className="hero-title">{Math.round(job.fitScore)}</p>
                <p className="muted">{job.explanation.join(" - ")}</p>
              </article>
              <article className="mini-panel">
                <strong>Source</strong>
                <p>{job.source}</p>
                <p className="muted">{job.sourceUrl}</p>
              </article>
              <article className="mini-panel">
                <strong>Application URL</strong>
                <p>{job.applicationUrl || "No application URL captured"}</p>
                <div className="row-wrap">
                  <a className="button-tertiary" href={job.applicationUrl} target="_blank" rel="noreferrer">
                    Open posting
                  </a>
                </div>
              </article>
              <article className="mini-panel detail-full">
                <strong>Description</strong>
                <p>{job.descriptionText || "No description captured yet."}</p>
              </article>
            </div>
          </div>

          <div className="surface">
            <div className="panel-header">
              <h2>Applications</h2>
              <p>Create and update application tracking directly from the job detail page.</p>
            </div>
            <ApplicationManager job={job} initialApplications={applications} />
          </div>
        </div>

        <div className="stack">
          <div>
            <div className="surface">
              <div className="panel-header">
                <div>
                  <h2>Fit reasoning</h2>
                  <p>Keep the score interpretable before you prioritize the opportunity.</p>
                </div>
              </div>
              <div className="checklist">
                {job.explanation.map((reason, index) => (
                  <div className="check-item" key={reason}>
                    <div className="check-indicator">{String(index + 1).padStart(2, "0")}</div>
                    <div>
                      <strong>{reason}</strong>
                      <p className="muted">Captured from the normalized job record.</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="surface">
            <div className="panel-header">
              <div>
                <h2>Operator checklist</h2>
                <p>Suggested next actions for moving this role forward deliberately.</p>
              </div>
            </div>
            <div className="stack">
              <div className="mini-panel">
                <strong>Validate the posting URL</strong>
                <p className="muted">Open the source and confirm the destination is a real posting or ATS page.</p>
              </div>
              <div className="mini-panel">
                <strong>Prepare supporting assets</strong>
                <p className="muted">Draft role-specific answers and a tailored resume variant before applying.</p>
              </div>
              <div className="mini-panel">
                <strong>Track the next step explicitly</strong>
                <p className="muted">Do not rely on memory. Record status, blocker, and follow-up timing.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
