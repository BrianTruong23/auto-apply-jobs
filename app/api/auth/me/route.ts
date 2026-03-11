import { NextRequest, NextResponse } from "next/server";

import { requireRequestUser } from "@/lib/server/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await requireRequestUser(request);
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ detail: "Authentication required." }, { status: 401 });
  }
}
