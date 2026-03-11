import { NextRequest, NextResponse } from "next/server";

import { requireRequestUser } from "@/lib/server/auth";
import { getJobRecord, listApplicationRecords } from "@/lib/server/repository";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRequestUser(request);
    const { id } = await params;
    const [job, applications] = await Promise.all([getJobRecord(user.id, id), listApplicationRecords(user.id)]);
    if (!job) {
      return NextResponse.json({ detail: "job not found" }, { status: 404 });
    }
    const relatedApplications = applications.filter((item) => item.job_id === id);
    return NextResponse.json({
      job,
      applications: relatedApplications,
      latestApplication: relatedApplications[0] || null,
    });
  } catch (error) {
    return NextResponse.json({ detail: error instanceof Error ? error.message : "Failed to load job detail." }, { status: 500 });
  }
}
