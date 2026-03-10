import { NextRequest, NextResponse } from "next/server";

import { updateApplicationRecord } from "@/lib/server/application-logic";
import { readStore, writeStore } from "@/lib/server/store";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = (await request.json()) as Record<string, unknown>;
  const data = await readStore();
  const current = data.applications.find((item) => item.id === id);
  if (!current) {
    return NextResponse.json({ detail: "application not found" }, { status: 404 });
  }

  const updated = updateApplicationRecord(current, {
    status: payload.status ? String(payload.status) : undefined,
    current_step: payload.current_step ? String(payload.current_step) : undefined,
    outcome: payload.outcome ? String(payload.outcome) : undefined,
    notes: payload.notes ? String(payload.notes) : undefined,
  });
  Object.assign(current, updated);
  await writeStore(data);
  return NextResponse.json(current);
}
