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
          <h1>Opportunity workspace</h1>
          <p>Filter, review, and move opportunities through the funnel with visible fit signals and immediate next actions.</p>
        </div>
        <div className="page-header-actions">
          <a href="/sources" className="button-secondary">
            Add source
          </a>
          <a href="/applications" className="button-primary">
            Open pipeline
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
          <span className="status-pill">Saved view: Active queue</span>
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
                <p className="muted">Fit score above 85, remote-friendly, company-preferred.</p>
              </div>
              <div className="mini-panel">
                <strong>Needs human review</strong>
                <p className="muted">Weak fit explanation or unclear location/source quality.</p>
              </div>
              <div className="mini-panel">
                <strong>Recent discoveries</strong>
                <p className="muted">Fresh roles not yet shortlisted or archived.</p>
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
                  <p className="muted">Hand off directly into application tracking once it is worth the effort.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
