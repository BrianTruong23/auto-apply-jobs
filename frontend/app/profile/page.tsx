import { getProfile } from "../../lib/api";
import { ProfileEditor } from "../../components/profile-editor";

export default async function ProfilePage() {
  const profile = await getProfile();

  return (
    <main className="page">
      <section className="panel">
        <div className="panel-header">
          <h1>Profile</h1>
          <p>This is the grounding layer for fit scoring, answer drafting, and form mapping.</p>
        </div>
        <div className="stack">
          <article className="answer-card">
            <div className="row">
              <strong>{profile.fullName}</strong>
              <span className="badge">{profile.location}</span>
            </div>
            <p className="muted">{profile.email}</p>
            <p>{profile.summary}</p>
          </article>
          <article className="answer-card">
            <strong>Preferred roles</strong>
            <p>{profile.preferredRoles.join(", ")}</p>
          </article>
          <article className="answer-card">
            <strong>Preferred companies</strong>
            <p>{profile.preferredCompanies.join(", ")}</p>
          </article>
          <article className="answer-card">
            <strong>Skills</strong>
            <p>{profile.skills.join(", ")}</p>
          </article>
          <article className="answer-card">
            <h2>Edit profile</h2>
            <ProfileEditor profile={profile} />
          </article>
        </div>
      </section>
    </main>
  );
}
