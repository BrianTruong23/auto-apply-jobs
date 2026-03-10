import { SourceList } from "../../components/source-list";
import { getSources } from "../../lib/api";

export default async function SourcesPage() {
  const sources = await getSources();

  return (
    <main className="page">
      <section className="panel">
        <div className="panel-header">
          <h1>Sources</h1>
          <p>Configure keywords, companies, locations, and manual URLs. Enabled sources participate in discovery runs.</p>
        </div>
        <SourceList sources={sources} />
      </section>
    </main>
  );
}
