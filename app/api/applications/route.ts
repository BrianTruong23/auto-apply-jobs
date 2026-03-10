import { NextRequest, NextResponse } from "next/server";

import { createApplicationRecord } from "@/lib/server/application-logic";
import { allocateId, createApplicationDbRecord, getJobRecord, listApplicationRecords } from "@/lib/server/repository";

export async function GET() {
  return NextResponse.json(await listApplicationRecords());
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as Record<string, unknown>;
  const jobId = String(payload.job_id || "");
  const job = await getJobRecord(jobId);
  if (!job) {
    return NextResponse.json({ detail: "job not found" }, { status: 404 });
  }

  const application = createApplicationRecord({
    id: await allocateId("app"),
    job,
    status: payload.status ? String(payload.status) : undefined,
    current_step: payload.current_step ? String(payload.current_step) : undefined,
    outcome: payload.outcome ? String(payload.outcome) : undefined,
    notes: payload.notes ? String(payload.notes) : undefined,
  });
  await createApplicationDbRecord(application);
  return NextResponse.json(application, { status: 201 });
}
