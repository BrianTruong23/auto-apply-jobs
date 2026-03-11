import { AuthRequired } from "@/components/auth-required";
import { getRuns, isAuthenticated } from "../../lib/api";

export default async function RunsPage() {
  if (!(await isAuthenticated())) {
    return <AuthRequired title="Log in to view run history" />;
  }

  const runs = await getRuns();

  return (
    <main className="page">
      <section className="page-header">
        <div>
          <p className="eyebrow">Runs</p>
          <h1>Reviewable automation history</h1>
          <p>Every discovery, drafting, sync, or assist step should be transparent enough to debug and confident enough to trust.</p>
        </div>
      </section>

      <section className="section-grid">
        <div className="surface">
          <div className="panel-header">
            <div>
              <h2>Recent run timeline</h2>
              <p>Chronological visibility into what executed, what failed, and what needs a retry.</p>
            </div>
          </div>
          <div className="timeline">
            {runs.length ? runs.map((run) => (
              <article className="timeline-item" key={run.id}>
                <div className="row">
                  <div>
                    <strong>{run.runType}</strong>
                    <p className="muted">{run.startedAt}</p>
                  </div>
                  <span className={`badge badge-${run.status}`}>{run.status}</span>
                </div>
                <p>{run.summary}</p>
                {run.finishedAt ? <p className="muted">Finished {run.finishedAt}</p> : null}
              </article>
            )) : (
              <div className="empty-state">
                <strong>No runs logged yet</strong>
                <p className="muted">Execute discovery, drafting, or sync actions to build a reviewable operational timeline.</p>
              </div>
            )}
          </div>
        </div>

        <div className="stack">
          <div className="surface">
            <div className="panel-header">
              <div>
                <h2>Run health snapshot</h2>
                <p>Quick sense of where the system is reliable and where intervention may be required.</p>
              </div>
            </div>
            <div className="grid-2">
              <div className="mini-panel">
                <span className="stat-label">Successful</span>
                <strong>{runs.filter((run) => run.status === "succeeded").length}</strong>
              </div>
              <div className="mini-panel">
                <span className="stat-label">Attention needed</span>
                <strong>{runs.filter((run) => run.status !== "succeeded").length}</strong>
              </div>
            </div>
          </div>

          <div className="surface">
            <div className="panel-header">
              <div>
                <h2>Transparency checklist</h2>
                <p>Every automation should be reviewable, interruptible, and easy to reason about.</p>
              </div>
            </div>
            <div className="checklist">
              <div className="check-item">
                <div className="check-indicator">01</div>
                <div>
                  <strong>Trace inputs and outputs</strong>
                  <p className="muted">Keep query, provider, and resulting objects visible to the operator.</p>
                </div>
              </div>
              <div className="check-item">
                <div className="check-indicator">02</div>
                <div>
                  <strong>Escalate failures clearly</strong>
                  <p className="muted">Separate provider errors, auth issues, and unsupported flows in the log stream.</p>
                </div>
              </div>
              <div className="check-item">
                <div className="check-indicator">03</div>
                <div>
                  <strong>Keep the human in control</strong>
                  <p className="muted">No silent submit steps. Every meaningful action should be observable and reversible.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
