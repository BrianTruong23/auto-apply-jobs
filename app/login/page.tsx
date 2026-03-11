import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { isAuthenticated } from "@/lib/api";

export default async function LoginPage() {
  if (await isAuthenticated()) {
    redirect("/");
  }

  return (
    <main className="login-page">
      <section className="auth-card auth-card-wide">
        <div className="auth-card-header">
          <p className="eyebrow">Job Application Hub</p>
          <h1>A calm workspace for managing your job search.</h1>
          <p>Track openings, prepare stronger applications, and keep each step reviewable in one focused place.</p>
        </div>
        <div className="auth-feature-grid">
          <div className="mini-panel">
            <span className="stat-label">Deliberate by default</span>
            <strong>Every recommendation stays reviewable</strong>
          </div>
          <div className="mini-panel">
            <span className="stat-label">Better applications</span>
            <strong>Answers and workflows stay grounded in your profile</strong>
          </div>
          <div className="mini-panel">
            <span className="stat-label">Private workspace</span>
            <strong>Your jobs, answers, and applications stay scoped to your account</strong>
          </div>
        </div>
        <div className="login-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Sign in</p>
              <h2>Continue to your workspace</h2>
              <p>Use your account to pick up where you left off.</p>
            </div>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
