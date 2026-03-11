import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="login-page">
      <section className="auth-card auth-card-wide">
        <div className="auth-card-header">
          <p className="eyebrow">Job Application Hub</p>
          <h1>Log in to your workspace</h1>
          <p>Access your user-scoped profile, jobs, applications, answer bank, and run history.</p>
        </div>
        <div className="auth-feature-grid">
          <div className="mini-panel">
            <span className="stat-label">Review-first</span>
            <strong>Every automation stays inspectable</strong>
          </div>
          <div className="mini-panel">
            <span className="stat-label">Grounded drafting</span>
            <strong>Answers use profile and resume context</strong>
          </div>
          <div className="mini-panel">
            <span className="stat-label">User scoped</span>
            <strong>Your data stays isolated per account</strong>
          </div>
        </div>
        <div className="login-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Authentication</p>
              <h2>Continue with Supabase Auth</h2>
              <p>Sign in or create an account to start managing your application workflow.</p>
            </div>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
