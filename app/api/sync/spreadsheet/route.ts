import { NextRequest, NextResponse } from "next/server";

import { requireRequestUser } from "@/lib/server/auth";
import { allocateId, createRunRecord, listJobRecords } from "@/lib/server/repository";

export async function POST(request: NextRequest) {
  try {
    const user = await requireRequestUser(request);
    const jobs = await listJobRecords(user.id);
    const result = {
      mode: "preview",
      source_of_truth: "app_database",
      target: "google_sheets",
      rows: jobs.length,
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

    await createRunRecord(user.id, {
      id: await allocateId(user.id, "run"),
      user_id: user.id,
      run_type: "spreadsheet_sync",
      status: "succeeded",
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      summary: `Prepared spreadsheet sync preview for ${jobs.length} jobs.`,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ detail: error instanceof Error ? error.message : "Spreadsheet sync preview failed." }, { status: 500 });
  }
}
