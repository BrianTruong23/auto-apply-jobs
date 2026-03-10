import { NextRequest, NextResponse } from "next/server";

import { createApplicationRecord } from "@/lib/server/application-logic";
import { nextId, readStore, writeStore } from "@/lib/server/store";

export async function GET() {
  const data = await readStore();
  return NextResponse.json(data.applications);
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as Record<string, unknown>;
  const jobId = String(payload.job_id || "");
  const data = await readStore();
  const job = data.jobs.find((item) => item.id === jobId);
  if (!job) {
    return NextResponse.json({ detail: "job not found" }, { status: 404 });
  }

  const application = createApplicationRecord({
    id: nextId("app", data.applications.map((item) => item.id)),
    job,
    status: payload.status ? String(payload.status) : undefined,
    current_step: payload.current_step ? String(payload.current_step) : undefined,
    outcome: payload.outcome ? String(payload.outcome) : undefined,
    notes: payload.notes ? String(payload.notes) : undefined,
  });
  data.applications.unshift(application);
  await writeStore(data);
  return NextResponse.json(application, { status: 201 });
}
