import { NextResponse } from "next/server";

import { nextId, readStore, writeStore } from "@/lib/server/store";

export async function POST() {
  const data = await readStore();
  const result = {
    mode: "preview",
    source_of_truth: "next_app_store",
    target: "google_sheets",
    rows: data.jobs.length,
    columns: [
      "company",
      "role",
      "source",
      "job_url",
      "date_found",
      "fit_score",
      "status",
      "date_applied",
      "notes",
      "follow_up_date",
      "outcome",
    ],
    idempotency: "row key should be application_id or job_id plus profile_id",
  };

  data.runs.unshift({
    id: nextId("run", data.runs.map((item) => item.id)),
    run_type: "spreadsheet_sync",
    status: "succeeded",
    started_at: new Date().toISOString(),
    finished_at: new Date().toISOString(),
    summary: `Prepared spreadsheet sync preview for ${data.jobs.length} jobs.`,
  });
  await writeStore(data);

  return NextResponse.json(result);
}
