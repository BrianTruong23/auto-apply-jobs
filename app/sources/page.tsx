import { AuthRequired } from "@/components/auth-required";
import { SourceManager } from "../../components/source-manager";
import { getSources, isAuthenticated } from "../../lib/api";

export default async function SourcesPage() {
  if (!(await isAuthenticated())) {
    return <AuthRequired title="Log in to manage job sources" />;
  }

  const sources = await getSources();

  return (
    <main className="page">
      <section className="page-header">
        <div>
          <p className="eyebrow">Sources</p>
          <h1>Discovery control room</h1>
          <p>Manage the search channels that feed your opportunity queue, validate connector quality, and run targeted discovery on demand.</p>
        </div>
        <div className="page-header-actions">
          <span className="status-pill">{sources.filter((source) => source.enabled).length} enabled</span>
        </div>
      </section>

      <div className="toolbar">
        <div className="toolbar-group">
          <span className="filter-chip filter-chip-active">All sources</span>
          <span className="filter-chip">Manual URLs</span>
          <span className="filter-chip">Company pages</span>
          <span className="filter-chip">Needs cleanup</span>
        </div>
        <div className="toolbar-group">
          <span className="status-pill">Discovery remains review-first</span>
        </div>
      </div>

      <SourceManager initialSources={sources} />
    </main>
  );
}
