"use client";

import { useState } from "react";

import { assertApiResponse, formatApiErrorMessage, getClientApiBaseUrl } from "@/lib/client-api";
import type { Profile } from "../types";

type ProfilePayload = {
  full_name: string;
  email: string;
  location: string;
  summary: string;
  resume_text: string;
  preferred_roles: string[];
  preferred_locations: string[];
  preferred_companies: string[];
  skills: string[];
};

function splitCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ProfileEditor({ profile }: { profile: Profile }) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [location, setLocation] = useState(profile.location);
  const [summary, setSummary] = useState(profile.summary);
  const [skills, setSkills] = useState(profile.skills.join(", "));
  const [preferredRoles, setPreferredRoles] = useState(profile.preferredRoles.join(", "));
  const [preferredLocations, setPreferredLocations] = useState(profile.preferredLocations.join(", "));
  const [preferredCompanies, setPreferredCompanies] = useState(profile.preferredCompanies.join(", "));
  const [resumeText, setResumeText] = useState(profile.resumeText);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onResumeFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const isTextFile =
      file.type.startsWith("text/") ||
      /\.(txt|md|json|csv)$/i.test(file.name);

    if (!isTextFile) {
      setState("error");
      setMessage("File selected, but automatic parsing currently supports text-based resume files only. Paste PDF or DOCX text below.");
      return;
    }

    const text = await file.text();
    setResumeText(text);
    setState("saved");
    setMessage(`Loaded resume text from ${file.name}. Save profile to persist it.`);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    setMessage("");

    const payload: ProfilePayload = {
      full_name: fullName,
      email,
      location,
      summary,
      resume_text: resumeText,
      preferred_roles: splitCsv(preferredRoles),
      preferred_locations: splitCsv(preferredLocations),
      preferred_companies: splitCsv(preferredCompanies),
      skills: splitCsv(skills),
    };

    try {
      const response = await fetch(`${getClientApiBaseUrl()}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      await assertApiResponse(response);

      setState("saved");
      setMessage("Profile saved.");
    } catch (error) {
      setState("error");
      setMessage(formatApiErrorMessage(error, "Unable to save profile. Check the API route and server logs."));
    }
  }

  return (
    <div className="editor-shell">
      <div className="editor-header">
        <div>
          <p className="eyebrow">Profile editor</p>
          <h3>Structured context for scoring, drafting, and autofill</h3>
        </div>
        <div className="status-cluster">
          <span className="status-pill">Resume grounding</span>
          <span className={`badge badge-${state === "error" ? "error" : "ready"}`}>{state === "saving" ? "saving" : "editable"}</span>
        </div>
      </div>

      <form className="form-grid" onSubmit={onSubmit}>
        <div className="field-group field-full">
          <div className="field-group-header">
            <strong>Identity</strong>
            <p className="muted">Used in autofill proposals and profile-aware personalization.</p>
          </div>
          <div className="field-grid">
            <label className="field">
              <span>Full name</span>
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} />
            </label>
            <label className="field">
              <span>Email</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label className="field">
              <span>Location</span>
              <input value={location} onChange={(event) => setLocation(event.target.value)} />
            </label>
            <label className="field field-span-2">
              <span>Summary</span>
              <textarea rows={4} value={summary} onChange={(event) => setSummary(event.target.value)} />
            </label>
          </div>
        </div>

        <div className="field-group field-full">
          <div className="field-group-header">
            <strong>Targeting inputs</strong>
            <p className="muted">Keep your search lanes and company priorities explicit.</p>
          </div>
          <div className="field-grid">
            <label className="field field-span-2">
              <span>Skills</span>
              <input value={skills} onChange={(event) => setSkills(event.target.value)} placeholder="TypeScript, React, Playwright, FastAPI" />
            </label>
            <label className="field field-span-2">
              <span>Preferred roles</span>
              <input value={preferredRoles} onChange={(event) => setPreferredRoles(event.target.value)} placeholder="Product Engineer, Platform Engineer" />
            </label>
            <label className="field">
              <span>Preferred locations</span>
              <input value={preferredLocations} onChange={(event) => setPreferredLocations(event.target.value)} placeholder="Remote, New York" />
            </label>
            <label className="field">
              <span>Preferred companies</span>
              <input value={preferredCompanies} onChange={(event) => setPreferredCompanies(event.target.value)} placeholder="OpenAI, Stripe, Ramp" />
            </label>
          </div>
        </div>

        <div className="field-group field-full">
          <div className="field-group-header">
            <strong>Resume source</strong>
            <p className="muted">Text-based files can be imported directly. PDF and DOCX still require pasted text for now.</p>
          </div>
          <div className="field-grid">
            <label className="field field-span-2">
              <span>Resume text</span>
              <textarea rows={8} value={resumeText} onChange={(event) => setResumeText(event.target.value)} />
            </label>
            <label className="field field-span-2">
              <span>Import resume text file</span>
              <input type="file" accept=".txt,.md,.json,.csv,.pdf,.doc,.docx" onChange={onResumeFileSelected} />
            </label>
          </div>
        </div>

        <div className="form-actions field-full">
          <button className="button-primary" type="submit" disabled={state === "saving"}>
            {state === "saving" ? "Saving..." : "Save profile"}
          </button>
          {message ? <span className={`inline-message inline-${state}`}>{message}</span> : null}
        </div>
      </form>
    </div>
  );
}
