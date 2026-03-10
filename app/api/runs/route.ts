import { NextResponse } from "next/server";

import { listRunRecords } from "@/lib/server/repository";

export async function GET() {
  return NextResponse.json(await listRunRecords());
}
