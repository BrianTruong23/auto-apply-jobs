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
      <section className="panel">
        <div className="panel-header">
          <h1>Jobs</h1>
          <p>Discovery pipeline output with fit scoring, status tracking, and source provenance.</p>
        </div>
        <JobsTable jobs={jobs} />
      </section>
    </main>
  );
}
