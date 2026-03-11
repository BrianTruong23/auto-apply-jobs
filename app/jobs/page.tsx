import { AuthRequired } from "@/components/auth-required";
import { JobsTable } from "../../components/jobs-table";
import { getJobs, isAuthenticated } from "../../lib/api";

export default async function JobsPage() {
  if (!(await isAuthenticated())) {
    return <AuthRequired title="Log in to view your jobs" />;
  }

  const jobs = await getJobs();

  return (
    <main className="page">
      <section className="page-header">
        <div>
          <p className="eyebrow">Jobs</p>
          <h1>Job review</h1>
          <p>Review new opportunities, compare fit, and decide which roles deserve actual application effort.</p>
        </div>
        <div className="page-header-actions">
          <a href="/sources" className="button-secondary">
            Sources
          </a>
          <a href="/applications" className="button-primary">
            Pipeline
          </a>
        </div>
      </section>

      <div className="toolbar">
        <div className="toolbar-group">
          <span className="filter-chip filter-chip-active">All jobs</span>
          <span className="filter-chip">High fit</span>
          <span className="filter-chip">Remote</span>
          <span className="filter-chip">Needs review</span>
        </div>
        <div className="toolbar-group">
          <span className="status-pill">Active queue</span>
          <button className="button-tertiary" type="button">Bulk actions</button>
        </div>
      </div>

      <section className="section-grid">
        <div className="surface">
          <div className="panel-header">
            <div>
              <h2>Current job set</h2>
              <p>Each row shows quality, provenance, and fit logic before you commit attention.</p>
            </div>
          </div>
          <JobsTable jobs={jobs} />
        </div>

        <div className="stack">
          <div className="surface">
            <div className="panel-header">
              <div>
                <h2>Saved views</h2>
                <p>Quick operating modes for power users.</p>
              </div>
            </div>
            <div className="stack">
              <div className="mini-panel">
                <strong>High-conviction shortlist</strong>
                <p className="muted">Strong fit, clean source, and worth focused application work.</p>
              </div>
              <div className="mini-panel">
                <strong>Needs human review</strong>
                <p className="muted">Unclear signals, weak explanation, or a questionable posting path.</p>
              </div>
              <div className="mini-panel">
                <strong>Recent discoveries</strong>
                <p className="muted">New roles that still need an explicit decision.</p>
              </div>
            </div>
          </div>

          <div className="surface">
            <div className="panel-header">
              <div>
                <h2>Action flow</h2>
                <p>Move quickly without losing traceability.</p>
              </div>
            </div>
            <div className="checklist">
              <div className="check-item">
                <div className="check-indicator">01</div>
                <div>
                  <strong>Review fit reasons</strong>
                  <p className="muted">Challenge the score before a job gets priority attention.</p>
                </div>
              </div>
              <div className="check-item">
                <div className="check-indicator">02</div>
                <div>
                  <strong>Open the posting</strong>
                  <p className="muted">Validate the role, location, and application flow from the source link.</p>
                </div>
              </div>
              <div className="check-item">
                <div className="check-indicator">03</div>
                <div>
                  <strong>Transition into applying</strong>
                  <p className="muted">Move a role into the pipeline only when it deserves deliberate follow-through.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
