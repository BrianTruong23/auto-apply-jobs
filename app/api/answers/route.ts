import { NextRequest, NextResponse } from "next/server";

import { allocateId, createAnswerRecord, ensureSeedData, listAnswerRecords } from "@/lib/server/repository";

export async function GET() {
  await ensureSeedData();
  return NextResponse.json(await listAnswerRecords());
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as Record<string, unknown>;
  const entry = {
    id: await allocateId("ans"),
    question_type: String(payload.question_type || "general"),
    normalized_question: String(payload.normalized_question || ""),
    answer_text: String(payload.answer_text || ""),
    usage_count: 0,
    last_used_at: undefined,
  };
  await createAnswerRecord(entry);
  return NextResponse.json(entry, { status: 201 });
}
