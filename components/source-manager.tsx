"use client";

import { useState } from "react";

import { SourceList } from "./source-list";
import type { DiscoveryResult, JobSource } from "../types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/api` : "http://localhost:3000/api");

function splitCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function SourceManager({ initialSources }: { initialSources: JobSource[] }) {
  const [sources, setSources] = useState(initialSources);
  const [name, setName] = useState("");
  const [type, setType] = useState("search_keyword");
  const [baseUrl, setBaseUrl] = useState("");
  const [keywords, setKeywords] = useState("");
  const [companies, setCompanies] = useState("");
  const [roles, setRoles] = useState("");
  const [locations, setLocations] = useState("");
  const [workplaceModes, setWorkplaceModes] = useState("remote");
  const [sourceMessage, setSourceMessage] = useState("");

  const [discoveryKeywords, setDiscoveryKeywords] = useState("software engineer ai");
  const [discoveryCompanies, setDiscoveryCompanies] = useState("");
  const [discoveryLocations, setDiscoveryLocations] = useState("Remote");
  const [discoveryModes, setDiscoveryModes] = useState("remote");
  const [manualUrls, setManualUrls] = useState("");
  const [discoveryState, setDiscoveryState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [discoveryResult, setDiscoveryResult] = useState<DiscoveryResult | null>(null);

  async function createSource(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSourceMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          base_url: baseUrl || null,
          keywords: splitCsv(keywords),
          companies: splitCsv(companies),
          roles: splitCsv(roles),
          locations: splitCsv(locations),
          workplace_modes: splitCsv(workplaceModes),
          enabled: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create source");
      }

      const row = await response.json();
      setSources((current) => [
        {
          id: row.id,
          name: row.name,
          type: row.type,
          baseUrl: row.base_url ?? undefined,
          keywords: row.keywords ?? [],
          companies: row.companies ?? [],
          roles: row.roles ?? [],
          locations: row.locations ?? [],
          workplaceModes: row.workplace_modes ?? [],
          enabled: row.enabled,
          lastCheckedAt: row.last_checked_at ?? undefined,
        },
        ...current,
      ]);
      setName("");
      setBaseUrl("");
      setKeywords("");
      setCompanies("");
      setRoles("");
      setLocations("");
      setSourceMessage("Source created.");
    } catch {
      setSourceMessage("Could not create source. Check backend availability.");
    }
  }

  async function runDiscovery(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDiscoveryState("running");
    setDiscoveryResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/sources/discover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: splitCsv(discoveryKeywords),
          companies: splitCsv(discoveryCompanies),
          locations: splitCsv(discoveryLocations),
          workplace_modes: splitCsv(discoveryModes),
          manual_urls: splitCsv(manualUrls),
        }),
      });

      if (!response.ok) {
        throw new Error("Discovery failed");
      }

      const result = (await response.json()) as DiscoveryResult;
      setDiscoveryResult(result);
      setDiscoveryState("done");
    } catch {
      setDiscoveryState("error");
    }
  }

  return (
    <div className="stack">
      <div className="two-col">
        <article className="answer-card">
          <h2>Create source</h2>
          <form className="form-grid" onSubmit={createSource}>
            <label className="field">
              <span>Name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className="field">
              <span>Type</span>
              <select value={type} onChange={(event) => setType(event.target.value)}>
                <option value="search_keyword">search_keyword</option>
                <option value="company_page">company_page</option>
                <option value="job_board">job_board</option>
                <option value="manual_url">manual_url</option>
              </select>
            </label>
            <label className="field field-full">
              <span>Base URL</span>
              <input value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} />
            </label>
            <label className="field field-full">
              <span>Keywords</span>
              <input value={keywords} onChange={(event) => setKeywords(event.target.value)} />
            </label>
            <label className="field field-full">
              <span>Companies</span>
              <input value={companies} onChange={(event) => setCompanies(event.target.value)} />
            </label>
            <label className="field field-full">
              <span>Roles</span>
              <input value={roles} onChange={(event) => setRoles(event.target.value)} />
            </label>
            <label className="field">
              <span>Locations</span>
              <input value={locations} onChange={(event) => setLocations(event.target.value)} />
            </label>
            <label className="field">
              <span>Modes</span>
              <input value={workplaceModes} onChange={(event) => setWorkplaceModes(event.target.value)} />
            </label>
            <div className="form-actions field-full">
              <button className="button-primary" type="submit">Add source</button>
              {sourceMessage ? <span className="inline-message inline-saved">{sourceMessage}</span> : null}
            </div>
          </form>
        </article>

        <article className="answer-card">
          <h2>Run discovery</h2>
          <form className="form-grid" onSubmit={runDiscovery}>
            <label className="field field-full">
              <span>Keywords</span>
              <input value={discoveryKeywords} onChange={(event) => setDiscoveryKeywords(event.target.value)} />
            </label>
            <label className="field field-full">
              <span>Companies</span>
              <input value={discoveryCompanies} onChange={(event) => setDiscoveryCompanies(event.target.value)} />
            </label>
            <label className="field">
              <span>Locations</span>
              <input value={discoveryLocations} onChange={(event) => setDiscoveryLocations(event.target.value)} />
            </label>
            <label className="field">
              <span>Modes</span>
              <input value={discoveryModes} onChange={(event) => setDiscoveryModes(event.target.value)} />
            </label>
            <label className="field field-full">
              <span>Manual URLs</span>
              <textarea rows={3} value={manualUrls} onChange={(event) => setManualUrls(event.target.value)} />
            </label>
            <div className="form-actions field-full">
              <button className="button-primary" type="submit" disabled={discoveryState === "running"}>
                {discoveryState === "running" ? "Running..." : "Run discovery"}
              </button>
              {discoveryState === "error" ? (
                <span className="inline-message inline-error">Discovery failed. Check backend and Brave key.</span>
              ) : null}
            </div>
          </form>
          {discoveryResult ? (
            <div className="result-panel">
              <p><strong>Query:</strong> {discoveryResult.query}</p>
              <p><strong>Processed:</strong> {discoveryResult.total_processed}</p>
              <p><strong>Created:</strong> {discoveryResult.created}</p>
              <p><strong>Fallback:</strong> {discoveryResult.used_fallback ? "yes" : "no"}</p>
            </div>
          ) : null}
        </article>
      </div>

      <SourceList sources={sources} />
    </div>
  );
}
