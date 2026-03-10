"use client";

import { useState } from "react";

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

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
  const [resumeText, setResumeText] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

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
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Profile update failed");
      }

      setState("saved");
      setMessage("Profile saved.");
    } catch {
      setState("error");
      setMessage("Unable to save profile. Check that the backend is running.");
    }
  }

  return (
    <form className="form-grid" onSubmit={onSubmit}>
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
      <label className="field field-full">
        <span>Summary</span>
        <textarea rows={4} value={summary} onChange={(event) => setSummary(event.target.value)} />
      </label>
      <label className="field field-full">
        <span>Skills (comma-separated)</span>
        <input value={skills} onChange={(event) => setSkills(event.target.value)} />
      </label>
      <label className="field field-full">
        <span>Preferred roles (comma-separated)</span>
        <input value={preferredRoles} onChange={(event) => setPreferredRoles(event.target.value)} />
      </label>
      <label className="field field-full">
        <span>Preferred locations (comma-separated)</span>
        <input value={preferredLocations} onChange={(event) => setPreferredLocations(event.target.value)} />
      </label>
      <label className="field field-full">
        <span>Preferred companies (comma-separated)</span>
        <input value={preferredCompanies} onChange={(event) => setPreferredCompanies(event.target.value)} />
      </label>
      <label className="field field-full">
        <span>Resume text</span>
        <textarea rows={6} value={resumeText} onChange={(event) => setResumeText(event.target.value)} />
      </label>
      <div className="form-actions field-full">
        <button className="button-primary" type="submit" disabled={state === "saving"}>
          {state === "saving" ? "Saving..." : "Save profile"}
        </button>
        {message ? <span className={`inline-message inline-${state}`}>{message}</span> : null}
      </div>
    </form>
  );
}
