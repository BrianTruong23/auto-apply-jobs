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
      <section className="panel">
        <div className="panel-header">
          <h1>Sources</h1>
          <p>Configure keywords, companies, locations, and manual URLs. Enabled sources participate in discovery runs.</p>
        </div>
        <SourceManager initialSources={sources} />
      </section>
    </main>
  );
}
