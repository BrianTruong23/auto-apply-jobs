import { NextRequest, NextResponse } from "next/server";

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

  const application = {
    id: nextId("app", data.applications.map((item) => item.id)),
    job_id: job.id,
    company: job.company,
    title: job.title,
    status: String(payload.status || "preparing"),
    current_step: String(payload.current_step || ""),
    outcome: payload.outcome ? String(payload.outcome) : undefined,
    notes: String(payload.notes || ""),
  };
  data.applications.unshift(application);
  await writeStore(data);
  return NextResponse.json(application, { status: 201 });
}
