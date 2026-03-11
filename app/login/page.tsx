import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="page">
      <section className="panel">
        <div className="panel-header">
          <h1>Log in</h1>
          <p>Use your Supabase Auth account. Each logged-in user gets their own profile and job-tracking data.</p>
        </div>
        <article className="answer-card">
          <LoginForm />
        </article>
      </section>
    </main>
  );
}
