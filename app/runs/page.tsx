import { AuthRequired } from "@/components/auth-required";
import { getRuns, isAuthenticated } from "../../lib/api";

export default async function RunsPage() {
  if (!(await isAuthenticated())) {
    return <AuthRequired title="Log in to view run history" />;
  }

  const runs = await getRuns();

  return (
    <main className="page">
      <section className="panel">
        <div className="panel-header">
          <h1>Run History</h1>
          <p>Auditability is a core product feature. Every discovery, sync, and assisted workflow should be reviewable.</p>
        </div>
        <div className="stack">
          {runs.map((run) => (
            <article className="run-card" key={run.id}>
              <div className="row">
                <strong>{run.runType}</strong>
                <span className={`badge badge-${run.status}`}>{run.status}</span>
              </div>
              <p>{run.summary}</p>
              <p className="muted">{run.startedAt}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
