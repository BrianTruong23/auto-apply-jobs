import { AuthRequired } from "../components/auth-required";
import { JobsTable } from "../components/jobs-table";
import { StatCard } from "../components/stat-card";
import { getDashboardData, getHealth, isAuthenticated } from "../lib/api";

export default async function HomePage() {
  if (!(await isAuthenticated())) {
    return <AuthRequired title="Log in to access your dashboard" />;
  }

  const [data, health] = await Promise.all([getDashboardData(), getHealth()]);

  const attentionItems = [
    {
      title: data.jobs.length ? "Shortlist the strongest remote roles" : "Create your first source pack",
      detail: data.jobs.length
        ? "Review the highest-fit jobs and move the best opportunities into an active application state."
        : "Add a company or keyword source so the hub can start discovering openings for you.",
    },
    {
      title: health.brave_configured ? "Discovery is armed" : "Connect Brave Search",
      detail: health.brave_configured
        ? "Run a fresh discovery cycle and validate the posting links before shortlisting."
        : "Real job discovery is currently blocked until the Brave Search key is configured.",
    },
    {
      title: data.answers.length ? "Expand answer memory" : "Seed the answer bank",
      detail: data.answers.length
        ? "Store company-specific answers for repeated prompts so you can reserve LLM usage for true deltas."
        : "Save a few approved responses so drafting becomes faster and more grounded.",
    },
  ];

  const pipeline = [
    { label: "Discovered", count: data.jobs.filter((job) => job.status === "discovered").length, tone: "discovered" },
    { label: "Shortlisted", count: data.jobs.filter((job) => job.status === "shortlisted").length, tone: "shortlisted" },
    { label: "Applying", count: data.jobs.filter((job) => ["preparing", "applying", "submitted"].includes(job.status)).length, tone: "preparing" },
    { label: "Finished", count: data.jobs.filter((job) => ["rejected", "offer", "archived"].includes(job.status)).length, tone: "archived" },
  ];

  const sourceHealth = [
    { label: "Sources", value: `${data.sources.filter((item) => item.enabled).length}/${data.sources.length || 0}`, detail: "enabled connectors" },
    { label: "OpenRouter", value: health.openrouter_configured ? "Ready" : "Missing", detail: "draft engine status" },
    { label: "Brave", value: health.brave_configured ? "Ready" : "Missing", detail: "discovery provider" },
    { label: "Persistence", value: health.persistence_mode, detail: "active storage mode" },
  ];

  return (
    <main className="page">
      <section className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Application operations command center</h1>
          <p>Track sourcing momentum, decide what needs review next, and keep every automation legible before it turns into an application step.</p>
        </div>
        <div className="page-header-actions">
          <a href="/sources" className="button-secondary">
            Manage sources
          </a>
          <a href="/answers" className="button-primary">
            Draft with context
          </a>
        </div>
      </section>

      <section className="hero">
        <div className="stack-lg">
          <div>
            <p className="eyebrow">System posture</p>
            <h2 className="hero-title">A serious workflow hub for discovering, vetting, and moving through applications deliberately.</h2>
            <p className="lede">The product is optimized for power users: clear fit signals, reviewable automation, reusable answer memory, and fast transitions from discovery to application execution.</p>
          </div>
          <div className="hero-metrics">
            <StatCard label="Tracked jobs" value={String(data.jobs.length)} detail="Scored and deduplicated across all sources" />
            <StatCard label="Answer assets" value={String(data.answers.length)} detail="Reusable answers ready for scoped drafting" />
            <StatCard label="Live sources" value={String(data.sources.filter((item) => item.enabled).length)} detail="Currently feeding the discovery pipeline" />
            <StatCard label="Recent runs" value={String(data.runs.length)} detail="Logged discovery, sync, and review actions" />
          </div>
        </div>

        <div className="surface">
          <div className="panel-header">
            <div>
              <h2>Next best actions</h2>
              <p>Keep the workflow moving without losing human control.</p>
            </div>
          </div>
          <div className="checklist">
            {attentionItems.map((item, index) => (
              <div className="check-item" key={item.title}>
                <div className="check-indicator">0{index + 1}</div>
                <div>
                  <strong>{item.title}</strong>
                  <p className="muted">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="command-grid">
        <div className="surface">
          <div className="panel-header">
            <div>
              <h2>Pipeline overview</h2>
              <p>See where opportunities are accumulating before the queue stalls.</p>
            </div>
          </div>
          <div className="grid-4">
            {pipeline.map((item) => (
              <div className="mini-panel" key={item.label}>
                <div className="row">
                  <span className={`badge badge-${item.tone}`}>{item.label}</span>
                  <strong>{item.count}</strong>
                </div>
                <p className="muted">Current jobs in this stage.</p>
              </div>
            ))}
          </div>
        </div>

        <div className="surface">
          <div className="panel-header">
            <div>
              <h2>System health</h2>
              <p>Actionable visibility into what is ready and what will block real work.</p>
            </div>
          </div>
          <div className="health-grid">
            {sourceHealth.map((item) => (
              <div className="health-item" key={item.label}>
                <span className="stat-label">{item.label}</span>
                <strong>{item.value}</strong>
                <p className="muted">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="attention-grid">
        <div className="attention-card">
          <div className="panel-header">
            <div>
              <h2>Top matches</h2>
              <p>Fit scores stay explainable so the shortlist feels earned rather than algorithmic.</p>
            </div>
          </div>
          <JobsTable jobs={data.jobs.slice(0, 5)} />
        </div>

        <div className="stack">
          <div className="attention-card">
            <div className="panel-header">
              <div>
                <h2>Recent activity</h2>
                <p>Keep a quick eye on operational throughput.</p>
              </div>
            </div>
            <div className="timeline">
              {data.runs.slice(0, 4).map((run) => (
                <div className="timeline-item" key={run.id}>
                  <div className="row">
                    <strong>{run.runType}</strong>
                    <span className={`badge badge-${run.status}`}>{run.status}</span>
                  </div>
                  <p>{run.summary}</p>
                  <p className="muted">{run.startedAt}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="attention-card">
            <div className="panel-header">
              <div>
                <h2>Source readiness</h2>
                <p>Spot weak connectors and empty channels before discovery quality drops.</p>
              </div>
            </div>
            <div className="stack">
              {data.sources.slice(0, 4).map((source) => (
                <div className="mini-panel" key={source.id}>
                  <div className="row">
                    <strong>{source.name}</strong>
                    <span className={`badge badge-${source.enabled ? "enabled" : "disabled"}`}>
                      {source.enabled ? "enabled" : "disabled"}
                    </span>
                  </div>
                  <p className="muted">{source.type}</p>
                  <p>{source.keywords.join(", ") || source.companies.join(", ") || "Manual source"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
