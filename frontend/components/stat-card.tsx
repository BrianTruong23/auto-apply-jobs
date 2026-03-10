export function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="muted">{detail}</div>
    </article>
  );
}
