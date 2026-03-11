import { NextRequest, NextResponse } from "next/server";

import { requireRequestUser } from "@/lib/server/auth";
import { allocateId, createAnswerRecord, ensureSeedData, listAnswerRecords } from "@/lib/server/repository";

export async function GET(request: NextRequest) {
  try {
    const user = await requireRequestUser(request);
    await ensureSeedData(user.id);
    return NextResponse.json(await listAnswerRecords(user.id));
  } catch (error) {
    return NextResponse.json({ detail: error instanceof Error ? error.message : "Failed to load answers." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRequestUser(request);
    const payload = (await request.json()) as Record<string, unknown>;
    const entry = {
      id: await allocateId(user.id, "ans"),
      user_id: user.id,
      question_type: String(payload.question_type || "general"),
      normalized_question: String(payload.normalized_question || ""),
      company_context: payload.company_context ? String(payload.company_context) : undefined,
      role_context: payload.role_context ? String(payload.role_context) : undefined,
      answer_text: String(payload.answer_text || ""),
      usage_count: 0,
      last_used_at: undefined,
    };
    await createAnswerRecord(user.id, entry);
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    return NextResponse.json({ detail: error instanceof Error ? error.message : "Failed to create answer." }, { status: 500 });
  }
}
