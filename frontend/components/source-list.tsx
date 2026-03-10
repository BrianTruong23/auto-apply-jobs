import { JobSource } from "../types";

export function SourceList({ sources }: { sources: JobSource[] }) {
  return (
    <div className="source-list">
      {sources.map((source) => (
        <article className="source-item" key={source.id}>
          <div className="row">
            <strong>{source.name}</strong>
            <span className="badge">{source.enabled ? "enabled" : "disabled"}</span>
          </div>
          <p className="muted">{source.type}</p>
          <p>Roles: {source.roles.join(", ") || "Any"}</p>
          <p>Locations: {source.locations.join(", ") || "Any"}</p>
          <p>Keywords: {source.keywords.join(", ") || "None"}</p>
        </article>
      ))}
    </div>
  );
}
