import { NextRequest, NextResponse } from "next/server";

import { nextId, readStore, writeStore } from "@/lib/server/store";

export async function GET() {
  const data = await readStore();
  return NextResponse.json(data.answers);
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as Record<string, unknown>;
  const data = await readStore();
  const entry = {
    id: nextId("ans", data.answers.map((item) => item.id)),
    question_type: String(payload.question_type || "general"),
    normalized_question: String(payload.normalized_question || ""),
    answer_text: String(payload.answer_text || ""),
    usage_count: 0,
    last_used_at: undefined,
  };
  data.answers.unshift(entry);
  await writeStore(data);
  return NextResponse.json(entry, { status: 201 });
}
