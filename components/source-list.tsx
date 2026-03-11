import { JobSource } from "../types";

export function SourceList({ sources }: { sources: JobSource[] }) {
  if (!sources.length) {
    return (
      <div className="empty-state">
        <strong>No sources configured yet</strong>
        <p className="muted">Create a search pack, company page, or manual URL source to activate discovery.</p>
      </div>
    );
  }

  return (
    <div className="source-list">
      {sources.map((source) => (
        <article className="source-item" key={source.id}>
          <div className="row">
            <div>
              <strong>{source.name}</strong>
              <p className="muted">{source.type.replaceAll("_", " ")}</p>
            </div>
            <span className={`badge badge-${source.enabled ? "enabled" : "disabled"}`}>{source.enabled ? "enabled" : "disabled"}</span>
          </div>
          <div className="source-health">
            <span className="tag">{source.roles.length ? `${source.roles.length} target roles` : "Any role"}</span>
            <span className="tag">{source.locations.length ? source.locations.join(", ") : "Any location"}</span>
            <span className="tag">{source.workplaceModes.join(", ") || "Any mode"}</span>
          </div>
          <p><strong>Keywords:</strong> {source.keywords.join(", ") || "None"}</p>
          <p><strong>Companies:</strong> {source.companies.join(", ") || "Any"}</p>
          <p><strong>Last sync:</strong> {source.lastCheckedAt || "Not run yet"}</p>
        </article>
      ))}
    </div>
  );
}
