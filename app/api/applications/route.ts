import { NextRequest, NextResponse } from "next/server";

import { requireRequestUser } from "@/lib/server/auth";
import { createApplicationRecord } from "@/lib/server/application-logic";
import { allocateId, createApplicationDbRecord, getJobRecord, listApplicationRecords } from "@/lib/server/repository";

export async function GET(request: NextRequest) {
  try {
    const user = await requireRequestUser(request);
    return NextResponse.json(await listApplicationRecords(user.id));
  } catch (error) {
    return NextResponse.json({ detail: error instanceof Error ? error.message : "Failed to load applications." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRequestUser(request);
    const payload = (await request.json()) as Record<string, unknown>;
    const jobId = String(payload.job_id || "");
    const job = await getJobRecord(user.id, jobId);
    if (!job) {
      return NextResponse.json({ detail: "job not found" }, { status: 404 });
    }

    const application = createApplicationRecord({
      id: await allocateId(user.id, "app"),
      job,
      status: payload.status ? String(payload.status) : undefined,
      current_step: payload.current_step ? String(payload.current_step) : undefined,
      outcome: payload.outcome ? String(payload.outcome) : undefined,
      notes: payload.notes ? String(payload.notes) : undefined,
    });
    application.user_id = user.id;
    await createApplicationDbRecord(user.id, application);
    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    return NextResponse.json({ detail: error instanceof Error ? error.message : "Failed to create application." }, { status: 500 });
  }
}
