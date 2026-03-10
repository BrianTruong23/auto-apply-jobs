import { NextResponse } from "next/server";

import { getJobDetail } from "@/lib/server/application-logic";
import { readStore } from "@/lib/server/store";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await readStore();
  const detail = getJobDetail(data, id);
  if (!detail) {
    return NextResponse.json({ detail: "job not found" }, { status: 404 });
  }
  return NextResponse.json(detail);
}
