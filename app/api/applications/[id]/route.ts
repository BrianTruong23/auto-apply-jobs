import { NextRequest, NextResponse } from "next/server";

import { requireRequestUser } from "@/lib/server/auth";
import { updateApplicationRecord } from "@/lib/server/application-logic";
import { getApplicationRecord, updateApplicationDbRecord } from "@/lib/server/repository";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRequestUser(request);
    const { id } = await params;
    const payload = (await request.json()) as Record<string, unknown>;
    const current = await getApplicationRecord(user.id, id);
    if (!current) {
      return NextResponse.json({ detail: "application not found" }, { status: 404 });
    }

    const updated = updateApplicationRecord(current, {
      status: payload.status ? String(payload.status) : undefined,
      current_step: payload.current_step ? String(payload.current_step) : undefined,
      outcome: payload.outcome ? String(payload.outcome) : undefined,
      notes: payload.notes ? String(payload.notes) : undefined,
    });
    updated.user_id = user.id;
    const saved = await updateApplicationDbRecord(user.id, updated);
    return NextResponse.json(saved);
  } catch (error) {
    return NextResponse.json({ detail: error instanceof Error ? error.message : "Failed to update application." }, { status: 500 });
  }
}
