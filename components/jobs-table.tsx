import Link from "next/link";

import { JobRecord } from "../types";

export function JobsTable({ jobs }: { jobs: JobRecord[] }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Company</th>
          <th>Role</th>
          <th>Fit</th>
          <th>Status</th>
          <th>Source</th>
          <th>Why it matches</th>
        </tr>
      </thead>
      <tbody>
        {jobs.map((job) => (
          <tr key={job.id}>
            <td>
              <strong>{job.company}</strong>
              <div className="muted">{job.location}</div>
            </td>
            <td>
              <div>
                <Link href={`/jobs/${job.id}`}>{job.title}</Link>
              </div>
              <div className="muted">{job.workplaceMode}</div>
            </td>
            <td>{Math.round(job.fitScore)}</td>
            <td>
              <span className="badge">{job.status}</span>
            </td>
            <td>
              <div>{job.source}</div>
              <div className="muted">{job.sourceUrl}</div>
            </td>
            <td>{job.explanation.join(" • ")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
