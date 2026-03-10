import { JobsTable } from "../components/jobs-table";
import { StatCard } from "../components/stat-card";
import { getDashboardData } from "../lib/api";

export default async function HomePage() {
  const data = await getDashboardData();

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">Job Application Hub</p>
          <h1>Reliable job discovery and application operations.</h1>
          <p className="lede">
            Human-in-the-loop workflows for sourcing, scoring, drafting, tracking, and assisted application execution.
          </p>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard label="Tracked Jobs" value={String(data.jobs.length)} detail="Normalized and deduplicated" />
        <StatCard label="Active Sources" value={String(data.sources.filter((item) => item.enabled).length)} detail="Brave + manual URLs" />
        <StatCard label="Answer Bank" value={String(data.answers.length)} detail="Reusable approved responses" />
        <StatCard label="Recent Runs" value={String(data.runs.length)} detail="Discovery, sync, and assist logs" />
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Top Matches</h2>
          <p>Fit scoring stays explainable so you can challenge the ranking before acting on it.</p>
        </div>
        <JobsTable jobs={data.jobs} />
      </section>
    </main>
  );
}
