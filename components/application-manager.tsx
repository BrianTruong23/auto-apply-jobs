"use client";

import { useState } from "react";

import { assertApiResponse, formatApiErrorMessage, getClientApiBaseUrl } from "@/lib/client-api";
import type { ApplicationRecord, JobRecord } from "@/types";

export function ApplicationManager({
  job,
  initialApplications,
}: {
  job: JobRecord;
  initialApplications: ApplicationRecord[];
}) {
  const [applications, setApplications] = useState(initialApplications);
  const [status, setStatus] = useState(initialApplications[0]?.status || "preparing");
  const [currentStep, setCurrentStep] = useState(initialApplications[0]?.currentStep || "");
  const [notes, setNotes] = useState(initialApplications[0]?.notes || "");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");

  async function createApplication(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    setMessage("");
    try {
      const response = await fetch(`${getClientApiBaseUrl()}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: job.id,
          status,
          current_step: currentStep,
          notes,
        }),
      });
      await assertApiResponse(response);
      const row = await response.json();
      const mapped: ApplicationRecord = {
        id: row.id,
        jobId: row.job_id,
        company: row.company,
        title: row.title,
        status: row.status,
        currentStep: row.current_step,
        outcome: row.outcome ?? undefined,
        notes: row.notes,
      };
      setApplications((current) => [mapped, ...current]);
      setMessage("Application tracked.");
      setState("idle");
    } catch (error) {
      setState("error");
      setMessage(formatApiErrorMessage(error, "Could not save application."));
    }
  }

  async function updateApplication(applicationId: string) {
    setState("saving");
    setMessage("");
    try {
      const response = await fetch(`${getClientApiBaseUrl()}/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          current_step: currentStep,
          notes,
        }),
      });
      await assertApiResponse(response);
      const row = await response.json();
      setApplications((current) =>
        current.map((item) =>
          item.id === applicationId
            ? {
                id: row.id,
                jobId: row.job_id,
                company: row.company,
                title: row.title,
                status: row.status,
                currentStep: row.current_step,
                outcome: row.outcome ?? undefined,
                notes: row.notes,
              }
            : item,
        ),
      );
      setMessage("Application updated.");
      setState("idle");
    } catch (error) {
      setState("error");
      setMessage(formatApiErrorMessage(error, "Could not update application."));
    }
  }

  return (
    <div className="detail-layout">
      <article className="surface">
        <div className="panel-header">
          <div>
            <h2>Track application</h2>
            <p>Capture the real next step, blockers, and notes before the opportunity slips into ambiguity.</p>
          </div>
          <span className={`badge badge-${state === "error" ? "error" : "ready"}`}>{state === "saving" ? "saving" : "ready"}</span>
        </div>
        <form className="form-grid" onSubmit={createApplication}>
          <label className="field">
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              {["discovered", "shortlisted", "preparing", "applying", "submitted", "rejected", "interview", "offer", "archived"].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Current step</span>
            <input value={currentStep} onChange={(event) => setCurrentStep(event.target.value)} placeholder="Tailor resume, complete screening form, schedule recruiter call" />
          </label>
          <label className="field field-full">
            <span>Notes</span>
            <textarea rows={5} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Capture blockers, custom answers, deadlines, and follow-up context." />
          </label>
          <div className="form-actions field-full">
            <button className="button-primary" type="submit" disabled={state === "saving"}>
              {state === "saving" ? "Saving..." : "Create application"}
            </button>
            {message ? <span className={state === "error" ? "inline-message inline-error" : "inline-message inline-saved"}>{message}</span> : null}
          </div>
        </form>
      </article>

      <div className="stack">
        <article className="surface">
          <div className="panel-header">
            <div>
              <h2>Tracked records</h2>
              <p>Update status and notes inline while keeping a clear audit of progress.</p>
            </div>
          </div>
          {applications.length ? (
            <div className="stack">
              {applications.map((application) => (
                <article className="answer-card" key={application.id}>
                  <div className="row">
                    <div>
                      <strong>{application.title}</strong>
                      <p className="muted">{application.company}</p>
                    </div>
                    <span className={`badge badge-${application.status}`}>{application.status}</span>
                  </div>
                  <p className="muted">{application.currentStep || "No step recorded"}</p>
                  <p>{application.notes || "No notes yet."}</p>
                  <div className="row-wrap">
                    {application.outcome ? <span className="tag">{application.outcome}</span> : null}
                    <button className="button-secondary" type="button" onClick={() => updateApplication(application.id)}>
                      Save edits
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>No applications tracked yet</strong>
              <p className="muted">Create the first application record from this job once it is worth active effort.</p>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
