import { NextRequest, NextResponse } from "next/server";

import { requireRequestUser } from "@/lib/server/auth";
import { listRunRecords } from "@/lib/server/repository";

export async function GET(request: NextRequest) {
  try {
    const user = await requireRequestUser(request);
    return NextResponse.json(await listRunRecords(user.id));
  } catch (error) {
    return NextResponse.json({ detail: error instanceof Error ? error.message : "Failed to load run history." }, { status: 500 });
  }
}
