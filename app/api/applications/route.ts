import { NextRequest, NextResponse } from "next/server";

import { createApplicationRecord } from "@/lib/server/application-logic";
import { allocateId, createApplicationDbRecord, getJobRecord, listApplicationRecords } from "@/lib/server/repository";

export async function GET() {
  try {
    return NextResponse.json(await listApplicationRecords());
  } catch (error) {
    return NextResponse.json({ detail: error instanceof Error ? error.message : "Failed to load applications." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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
  } catch (error) {
    return NextResponse.json({ detail: error instanceof Error ? error.message : "Failed to create application." }, { status: 500 });
  }
}
