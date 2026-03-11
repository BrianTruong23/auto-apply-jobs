"use client";

import { useState } from "react";

import { assertApiResponse, formatApiErrorMessage, getClientApiBaseUrl } from "@/lib/client-api";
import { SourceList } from "./source-list";
import type { DiscoveryResult, JobSource } from "../types";

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
  const [sourceMessageTone, setSourceMessageTone] = useState<"saved" | "error">("saved");

  const [discoveryKeywords, setDiscoveryKeywords] = useState("software engineer ai");
  const [discoveryCompanies, setDiscoveryCompanies] = useState("");
  const [discoveryLocations, setDiscoveryLocations] = useState("Remote");
  const [discoveryModes, setDiscoveryModes] = useState("remote");
  const [manualUrls, setManualUrls] = useState("");
  const [discoveryState, setDiscoveryState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [discoveryResult, setDiscoveryResult] = useState<DiscoveryResult | null>(null);
  const [discoveryMessage, setDiscoveryMessage] = useState("");

  async function createSource(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSourceMessage("");
    setSourceMessageTone("saved");

    try {
      const response = await fetch(`${getClientApiBaseUrl()}/api/sources`, {
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

      await assertApiResponse(response);

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
      setSourceMessageTone("saved");
    } catch (error) {
      setSourceMessage(formatApiErrorMessage(error, "Could not create source."));
      setSourceMessageTone("error");
    }
  }

  async function runDiscovery(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDiscoveryState("running");
    setDiscoveryResult(null);
    setDiscoveryMessage("");

    try {
      const response = await fetch(`${getClientApiBaseUrl()}/api/sources/discover`, {
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

      await assertApiResponse(response);

      const result = (await response.json()) as DiscoveryResult;
      setDiscoveryResult(result);
      setDiscoveryState("done");
    } catch (error) {
      setDiscoveryState("error");
      setDiscoveryMessage(formatApiErrorMessage(error, "Discovery failed. Check Supabase and Brave configuration."));
    }
  }

  return (
    <div className="sources-layout">
      <div className="stack-lg">
        <article className="surface">
          <div className="panel-header">
            <div>
              <h2>Source registry</h2>
              <p>Store discovery packs explicitly so searches stay reviewable, repeatable, and easy to tune.</p>
            </div>
            <span className="status-pill">{sources.filter((source) => source.enabled).length} active</span>
          </div>

          <form className="form-grid" onSubmit={createSource}>
            <label className="field">
              <span>Name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="AI product roles" />
            </label>
            <label className="field">
              <span>Type</span>
              <select value={type} onChange={(event) => setType(event.target.value)}>
                <option value="search_keyword">search keyword</option>
                <option value="company_page">company page</option>
                <option value="job_board">job board</option>
                <option value="manual_url">manual URL</option>
              </select>
            </label>
            <label className="field field-full">
              <span>Base URL</span>
              <input value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} placeholder="https://careers.example.com" />
            </label>
            <label className="field field-span-2">
              <span>Keywords</span>
              <input value={keywords} onChange={(event) => setKeywords(event.target.value)} placeholder="software engineer ai, product engineer" />
            </label>
            <label className="field">
              <span>Companies</span>
              <input value={companies} onChange={(event) => setCompanies(event.target.value)} placeholder="OpenAI, Ramp, Stripe" />
            </label>
            <label className="field">
              <span>Roles</span>
              <input value={roles} onChange={(event) => setRoles(event.target.value)} placeholder="Software Engineer, Product Engineer" />
            </label>
            <label className="field">
              <span>Locations</span>
              <input value={locations} onChange={(event) => setLocations(event.target.value)} placeholder="Remote, New York" />
            </label>
            <label className="field">
              <span>Workplace modes</span>
              <input value={workplaceModes} onChange={(event) => setWorkplaceModes(event.target.value)} placeholder="remote, hybrid" />
            </label>
            <div className="form-actions field-full">
              <button className="button-primary" type="submit">Add source</button>
              {sourceMessage ? (
                <span className={sourceMessageTone === "error" ? "inline-message inline-error" : "inline-message inline-saved"}>
                  {sourceMessage}
                </span>
              ) : null}
            </div>
          </form>
        </article>

        <article className="surface">
          <div className="panel-header">
            <div>
              <h2>Configured sources</h2>
              <p>Inspect the channels feeding discovery and verify they still match your search posture.</p>
            </div>
          </div>
          <SourceList sources={sources} />
        </article>
      </div>

      <div className="stack">
        <article className="surface">
          <div className="panel-header">
            <div>
              <h2>Run discovery</h2>
              <p>Trigger a bounded crawl with explicit keywords, company targets, and manual URLs.</p>
            </div>
            <span className={`badge badge-${discoveryState === "error" ? "failed" : discoveryState === "done" ? "succeeded" : "ready"}`}>
              {discoveryState === "running" ? "running" : discoveryState === "done" ? "complete" : "ready"}
            </span>
          </div>
          <form className="form-grid" onSubmit={runDiscovery}>
            <label className="field field-full">
              <span>Keywords</span>
              <input value={discoveryKeywords} onChange={(event) => setDiscoveryKeywords(event.target.value)} />
            </label>
            <label className="field field-full">
              <span>Companies</span>
              <input value={discoveryCompanies} onChange={(event) => setDiscoveryCompanies(event.target.value)} placeholder="Optional company shortlist" />
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
              <textarea rows={4} value={manualUrls} onChange={(event) => setManualUrls(event.target.value)} placeholder="Paste one posting or career URL per line." />
            </label>
            <div className="form-actions field-full">
              <button className="button-primary" type="submit" disabled={discoveryState === "running"}>
                {discoveryState === "running" ? "Running..." : "Run discovery"}
              </button>
              {discoveryState === "error" ? (
                <span className="inline-message inline-error">{discoveryMessage || "Discovery failed. Check Supabase and Brave configuration."}</span>
              ) : null}
            </div>
          </form>
        </article>

        <article className="surface">
          <div className="panel-header">
            <div>
              <h2>Latest run</h2>
              <p>Inspect returned postings before moving them into the pipeline.</p>
            </div>
          </div>
          {discoveryResult ? (
            <div className="stack">
              <div className="grid-3">
                <div className="mini-panel">
                  <span className="stat-label">Processed</span>
                  <strong>{discoveryResult.total_processed}</strong>
                  <p className="muted">Total candidates examined</p>
                </div>
                <div className="mini-panel">
                  <span className="stat-label">Created</span>
                  <strong>{discoveryResult.created}</strong>
                  <p className="muted">Normalized jobs saved</p>
                </div>
                <div className="mini-panel">
                  <span className="stat-label">Mode</span>
                  <strong>{discoveryResult.used_fallback ? "Fallback" : "Brave"}</strong>
                  <p className="muted">{discoveryResult.query}</p>
                </div>
              </div>
              <div className="stack">
                {discoveryResult.jobs.slice(0, 5).map((job) => (
                  <div className="list-row" key={job.id}>
                    <div>
                      <strong>{job.company}</strong>
                      <p className="muted">{job.title}</p>
                    </div>
                    <div className="row-wrap">
                      <span className={`badge badge-${job.status}`}>{job.status}</span>
                      <a className="button-tertiary" href={job.applicationUrl} target="_blank" rel="noreferrer">
                        Open posting
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <strong>No discovery run yet</strong>
              <p className="muted">Run a query to inspect returned postings, source quality, and fallback behavior.</p>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
