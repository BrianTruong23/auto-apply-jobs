import { NextResponse } from "next/server";

import { listJobRecords } from "@/lib/server/repository";

export async function GET() {
  try {
    return NextResponse.json(await listJobRecords());
  } catch (error) {
    return NextResponse.json({ detail: error instanceof Error ? error.message : "Failed to load jobs." }, { status: 500 });
  }
}
