import { AuthRequired } from "@/components/auth-required";
import { getApplications, isAuthenticated } from "@/lib/api";

const stages = ["preparing", "applying", "submitted", "interview"];

export default async function ApplicationsPage() {
  if (!(await isAuthenticated())) {
    return <AuthRequired title="Log in to view your applications" />;
  }

  const applications = await getApplications();

  return (
    <main className="page">
      <section className="page-header">
        <div>
          <p className="eyebrow">Applications</p>
          <h1>Application pipeline</h1>
          <p>Manage active opportunities like a workflow system: visible blockers, clear stages, and explicit next steps.</p>
        </div>
        <div className="page-header-actions">
          <button className="button-secondary" type="button">List view</button>
          <button className="button-primary" type="button">Kanban view</button>
        </div>
      </section>

      <div className="toolbar">
        <div className="toolbar-group">
          <span className="filter-chip filter-chip-active">Active pipeline</span>
          <span className="filter-chip">Follow-up needed</span>
          <span className="filter-chip">Interview loop</span>
          <span className="filter-chip">Blocked</span>
        </div>
        <div className="toolbar-group">
          <span className="status-pill">{applications.length} tracked applications</span>
        </div>
      </div>

      <section className="attention-grid">
        <div className="kanban">
          {stages.map((stage) => {
            const stageItems = applications.filter((application) => application.status === stage);
            return (
              <div className="kanban-column" key={stage}>
                <div className="kanban-column-header">
                  <strong>{stage}</strong>
                  <span className={`badge badge-${stage}`}>{stageItems.length}</span>
                </div>
                <div className="kanban-list">
                  {stageItems.length ? (
                    stageItems.map((application) => (
                      <article className="pipeline-card" key={application.id}>
                        <div className="row">
                          <strong>{application.company}</strong>
                          <span className={`badge badge-${application.status}`}>{application.status}</span>
                        </div>
                        <p>{application.title}</p>
                        <p className="muted">{application.currentStep || "No next step documented."}</p>
                        <div className="tag-list">
                          <span className="tag">{application.outcome || "in progress"}</span>
                          <span className="tag">{application.notes ? "notes attached" : "no notes"}</span>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="empty-state">
                      <strong>No applications</strong>
                      <p className="muted">Nothing in {stage} right now.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="stack">
          <div className="surface">
            <div className="panel-header">
              <div>
                <h2>Attention needed</h2>
                <p>Expose the next operational move instead of hiding workflow debt.</p>
              </div>
            </div>
            <div className="checklist">
              <div className="check-item">
                <div className="check-indicator">01</div>
                <div>
                  <strong>Move shortlisted jobs into preparation</strong>
                  <p className="muted">Convert passive interest into a concrete next action, resume variant, or drafting step.</p>
                </div>
              </div>
              <div className="check-item">
                <div className="check-indicator">02</div>
                <div>
                  <strong>Document blockers before context disappears</strong>
                  <p className="muted">If an application stalls, capture whether the issue was timing, missing answers, or unsupported form flow.</p>
                </div>
              </div>
              <div className="check-item">
                <div className="check-indicator">03</div>
                <div>
                  <strong>Follow through on submitted applications</strong>
                  <p className="muted">Treat follow-ups and interview prep as tracked work, not implicit memory.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="surface">
            <div className="panel-header">
              <div>
                <h2>Pipeline metrics</h2>
                <p>Serious workflows stay measurable.</p>
              </div>
            </div>
            <div className="grid-2">
              <div className="mini-panel">
                <span className="stat-label">Active</span>
                <strong>{applications.filter((application) => ["preparing", "applying", "submitted", "interview"].includes(application.status)).length}</strong>
              </div>
              <div className="mini-panel">
                <span className="stat-label">Closed</span>
                <strong>{applications.filter((application) => ["rejected", "offer"].includes(application.status)).length}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
