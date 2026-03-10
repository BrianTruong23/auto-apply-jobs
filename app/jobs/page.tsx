import { JobsTable } from "../../components/jobs-table";
import { getJobs } from "../../lib/api";

export default async function JobsPage() {
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
