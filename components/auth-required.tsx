import Link from "next/link";

export function AuthRequired({ title = "Authentication required" }: { title?: string }) {
  return (
    <main className="page">
      <section className="panel">
        <div className="panel-header">
          <h1>{title}</h1>
          <p>Log in with Supabase Auth to access your own profile, jobs, applications, and answer bank.</p>
        </div>
        <article className="answer-card">
          <Link href="/login" className="button-primary">
            Go to login
          </Link>
        </article>
      </section>
    </main>
  );
}
