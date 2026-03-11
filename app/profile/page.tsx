import { AuthRequired } from "@/components/auth-required";
import { ProfileEditor } from "../../components/profile-editor";
import { getProfile, isAuthenticated } from "../../lib/api";

export default async function ProfilePage() {
  if (!(await isAuthenticated())) {
    return <AuthRequired title="Log in to manage your profile" />;
  }

  const profile = await getProfile();
  const setupItems = [
    {
      label: "Identity",
      detail: profile.fullName && profile.email ? "Configured" : "Needs attention",
      complete: Boolean(profile.fullName && profile.email),
    },
    {
      label: "Targeting",
      detail: profile.preferredRoles.length || profile.preferredCompanies.length ? "Configured" : "Needs attention",
      complete: Boolean(profile.preferredRoles.length || profile.preferredCompanies.length),
    },
    {
      label: "Resume grounding",
      detail: profile.resumeText ? `${profile.resumeText.length} chars loaded` : "Missing",
      complete: Boolean(profile.resumeText),
    },
  ];
  const nextStep = !profile.fullName || !profile.email
    ? "Start by adding your identity details so application assistance can fill the basics correctly."
    : !profile.resumeText
      ? "Add resume text next so fit scoring and answer drafting have real grounding."
      : "Refine roles, locations, and companies so discovery and ranking stay focused.";

  return (
    <main className="page">
      <section className="page-header">
        <div>
          <p className="eyebrow">Profile</p>
          <h1>Your operating profile</h1>
          <p>This page defines how the system should represent you. Use it to set your identity, target roles, and resume context so scoring, drafting, and assisted applications stay specific.</p>
        </div>
        <div className="page-header-actions">
          <span className="status-pill">{setupItems.filter((item) => item.complete).length}/3 setup areas ready</span>
        </div>
      </section>

      <section className="command-grid">
        <div className="surface">
          <div className="panel-header">
            <div>
              <h2>What this page is for</h2>
              <p>Set the source-of-truth context used across discovery, fit scoring, answer drafting, and application assistance.</p>
            </div>
          </div>
          <div className="grid-3">
            <div className="mini-panel">
              <span className="stat-label">Discovery</span>
              <strong>Better ranking</strong>
              <p className="muted">Preferred roles, companies, and locations sharpen what gets surfaced first.</p>
            </div>
            <div className="mini-panel">
              <span className="stat-label">Drafting</span>
              <strong>Grounded answers</strong>
              <p className="muted">Resume text and summary give Gemini and the answer bank better context.</p>
            </div>
            <div className="mini-panel">
              <span className="stat-label">Applications</span>
              <strong>Cleaner autofill</strong>
              <p className="muted">Identity and structured preferences improve human-in-the-loop form assistance.</p>
            </div>
          </div>
        </div>

        <div className="surface">
          <div className="panel-header">
            <div>
              <h2>Do this next</h2>
              <p>Use the setup state to move through the page in the right order.</p>
            </div>
          </div>
          <div className="checklist">
            {setupItems.map((item, index) => (
              <div className="check-item" key={item.label}>
                <div className="check-indicator">{String(index + 1).padStart(2, "0")}</div>
                <div>
                  <strong>{item.label}</strong>
                  <p className="muted">{item.detail}</p>
                </div>
                <span className={`badge badge-${item.complete ? "ready" : "partial"}`}>
                  {item.complete ? "ready" : "next"}
                </span>
              </div>
            ))}
          </div>
          <div className="mini-panel">
            <span className="stat-label">Recommended next action</span>
            <strong>{nextStep}</strong>
          </div>
        </div>
      </section>

      <section className="profile-layout">
        <div className="stack-lg">
          <div className="surface">
            <div className="panel-header">
              <div>
                <h2>Profile snapshot</h2>
                <p>Quick preview of the information the rest of the product is using right now.</p>
              </div>
              <span className="badge badge-ready">Ready</span>
            </div>
            <div className="grid-2">
              <div className="mini-panel">
                <span className="stat-label">Name</span>
                <strong>{profile.fullName || "Not set"}</strong>
                <p className="muted">{profile.email || "Add an email to improve autofill coverage."}</p>
              </div>
              <div className="mini-panel">
                <span className="stat-label">Location</span>
                <strong>{profile.location || "Not set"}</strong>
                <p className="muted">Used for fit scoring and source filtering.</p>
              </div>
              <div className="mini-panel">
                <span className="stat-label">Preferred roles</span>
                <strong>{profile.preferredRoles.length}</strong>
                <p className="muted">{profile.preferredRoles.join(", ") || "No target roles yet."}</p>
              </div>
              <div className="mini-panel">
                <span className="stat-label">Resume text</span>
                <strong>{profile.resumeText ? `${profile.resumeText.length} chars` : "Empty"}</strong>
                <p className="muted">Upload text-based resumes for faster grounding.</p>
              </div>
            </div>
          </div>

          <div className="surface">
            <div className="panel-header">
              <div>
                <h2>Complete and update your setup</h2>
                <p>Fill the core sections below, then save once you are happy with how your profile will drive the rest of the workflow.</p>
              </div>
            </div>
            <ProfileEditor profile={profile} />
          </div>
        </div>

        <div className="stack">
          <div className="surface">
            <div className="panel-header">
              <div>
                <h2>Search preference preview</h2>
                <p>How your discovery filters and prioritization inputs are currently scoped.</p>
              </div>
            </div>
            <div className="stack">
              <div className="mini-panel">
                <span className="stat-label">Preferred companies</span>
                <div className="tag-list">
                  {profile.preferredCompanies.length
                    ? profile.preferredCompanies.map((company) => <span className="tag" key={company}>{company}</span>)
                    : <span className="muted">No preferred companies set.</span>}
                </div>
              </div>
              <div className="mini-panel">
                <span className="stat-label">Preferred locations</span>
                <div className="tag-list">
                  {profile.preferredLocations.length
                    ? profile.preferredLocations.map((location) => <span className="tag" key={location}>{location}</span>)
                    : <span className="muted">No preferred locations set.</span>}
                </div>
              </div>
              <div className="mini-panel">
                <span className="stat-label">Core skills</span>
                <div className="tag-list">
                  {profile.skills.length
                    ? profile.skills.map((skill) => <span className="tag" key={skill}>{skill}</span>)
                    : <span className="muted">No skills listed yet.</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="surface">
            <div className="panel-header">
              <div>
                <h2>How this profile gets used</h2>
                <p>Human-in-the-loop works best when the system has strong structure to work from.</p>
              </div>
            </div>
            <div className="checklist">
              <div className="check-item">
                <div className="check-indicator">01</div>
                <div>
                  <strong>Improves fit scoring</strong>
                  <p className="muted">Titles, locations, and companies are compared against this structured profile.</p>
                </div>
              </div>
              <div className="check-item">
                <div className="check-indicator">02</div>
                <div>
                  <strong>Grounds LLM drafting</strong>
                  <p className="muted">Draft answers become more specific when resume text and skills are present.</p>
                </div>
              </div>
              <div className="check-item">
                <div className="check-indicator">03</div>
                <div>
                  <strong>Supports form assistance</strong>
                  <p className="muted">Structured fields are easier to map than loose prompts or fragmented notes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
