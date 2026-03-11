import { NextResponse } from "next/server";

import { listRunRecords } from "@/lib/server/repository";

export async function GET() {
  try {
    return NextResponse.json(await listRunRecords());
  } catch (error) {
    return NextResponse.json({ detail: error instanceof Error ? error.message : "Failed to load run history." }, { status: 500 });
  }
}
