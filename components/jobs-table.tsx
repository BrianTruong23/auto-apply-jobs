import Link from "next/link";

import type { JobRecord } from "../types";

function scoreTone(score: number) {
  if (score >= 85) return "strong";
  if (score >= 70) return "good";
  return "watch";
}

export function JobsTable({ jobs }: { jobs: JobRecord[] }) {
  if (!jobs.length) {
    return (
      <div className="empty-state">
        <strong>No jobs in view</strong>
        <p className="muted">Run discovery or add manual sources to start filling this workspace with scored opportunities.</p>
      </div>
    );
  }

  return (
    <div className="jobs-grid">
      {jobs.map((job) => (
        <article className="job-row" key={job.id}>
          <div className="job-main">
            <div className="row-wrap">
              <span className={`badge badge-${job.status}`}>{job.status}</span>
              <span className={`badge badge-${job.workplaceMode}`}>{job.workplaceMode}</span>
              <span className="tag">{job.source}</span>
            </div>
            <Link href={`/jobs/${job.id}`} className="job-title">
              {job.title}
            </Link>
            <div className="job-meta">
              <strong>{job.company}</strong>
              <span>{job.location}</span>
              {job.postedAt ? <span>Found {job.postedAt.slice(0, 10)}</span> : null}
            </div>
          </div>

          <div className="job-score">
            <div className="metric-inline">
              <strong>{Math.round(job.fitScore)}</strong>
              <span className="muted">fit</span>
            </div>
            <div className="score-bar">
              <div className={`score-fill score-${scoreTone(job.fitScore)}`} style={{ width: `${Math.max(12, Math.min(100, job.fitScore))}%` }} />
            </div>
          </div>

          <div className="stack">
            <span className="stat-label">Match signals</span>
            <div className="tag-list">
              {job.explanation.slice(0, 3).map((reason) => (
                <span className="tag" key={reason}>
                  {reason}
                </span>
              ))}
            </div>
          </div>

          <div className="stack">
            <Link href={`/jobs/${job.id}`} className="button-secondary">
              Review job
            </Link>
            <a className="button-tertiary" href={job.applicationUrl} target="_blank" rel="noreferrer">
              Open posting
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
