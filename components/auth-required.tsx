import Link from "next/link";

export function AuthRequired({ title = "Authentication required" }: { title?: string }) {
  return (
    <main className="login-page">
      <section className="auth-card auth-guard">
        <div className="auth-card-header">
          <p className="eyebrow">Private workspace</p>
          <h1>{title}</h1>
          <p>Supabase Auth gates profile data, jobs, applications, answer memory, and operational logs per user.</p>
        </div>
        <div className="login-panel">
          <div className="stack">
            <div>
              <strong>Access required</strong>
              <p className="muted">Log in to continue into your personal application operations dashboard.</p>
            </div>
            <Link href="/login" className="button-primary">
              Go to login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
