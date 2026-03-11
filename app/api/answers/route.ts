import { NextRequest, NextResponse } from "next/server";

import { allocateId, createAnswerRecord, ensureSeedData, listAnswerRecords } from "@/lib/server/repository";

export async function GET() {
  try {
    await ensureSeedData();
    return NextResponse.json(await listAnswerRecords());
  } catch (error) {
    return NextResponse.json({ detail: error instanceof Error ? error.message : "Failed to load answers." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const entry = {
      id: await allocateId("ans"),
      question_type: String(payload.question_type || "general"),
      normalized_question: String(payload.normalized_question || ""),
      company_context: payload.company_context ? String(payload.company_context) : undefined,
      role_context: payload.role_context ? String(payload.role_context) : undefined,
      answer_text: String(payload.answer_text || ""),
      usage_count: 0,
      last_used_at: undefined,
    };
    await createAnswerRecord(entry);
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    return NextResponse.json({ detail: error instanceof Error ? error.message : "Failed to create answer." }, { status: 500 });
  }
}
