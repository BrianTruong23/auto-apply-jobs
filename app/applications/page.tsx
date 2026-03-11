import { AuthRequired } from "@/components/auth-required";
import { getApplications, isAuthenticated } from "@/lib/api";

export default async function ApplicationsPage() {
  if (!(await isAuthenticated())) {
    return <AuthRequired title="Log in to view your applications" />;
  }

  const applications = await getApplications();

  return (
    <main className="page">
      <section className="panel">
        <div className="panel-header">
          <h1>Applications</h1>
          <p>Review every tracked application state in one place.</p>
        </div>
        <div className="stack">
          {applications.length ? (
            applications.map((application) => (
              <article className="answer-card" key={application.id}>
                <div className="row">
                  <strong>{application.company}</strong>
                  <span className="badge">{application.status}</span>
                </div>
                <p>{application.title}</p>
                <p className="muted">{application.currentStep || "No current step"}</p>
                <p>{application.notes || "No notes"}</p>
              </article>
            ))
          ) : (
            <article className="answer-card">
              <p>No applications yet. Open a job detail page to create one.</p>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
