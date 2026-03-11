import { NextRequest, NextResponse } from "next/server";

import { requireRequestUser } from "@/lib/server/auth";
import { classifyQuestion, generateAnswerWithOpenRouter, normalizeText, selectReusableAnswer } from "@/lib/server/domain";
import { ensureSeedData, getProfileRecord, incrementAnswerUsage, listAnswerRecords } from "@/lib/server/repository";

export async function POST(request: NextRequest) {
  try {
    const user = await requireRequestUser(request);
    const payload = (await request.json()) as Record<string, unknown>;
    const question = String(payload.question || "");
    const company = payload.company ? String(payload.company) : undefined;
    const role = payload.role ? String(payload.role) : undefined;
    const jobDescription = payload.job_description ? String(payload.job_description) : undefined;

    await ensureSeedData(user.id);
    const [answers, profile] = await Promise.all([listAnswerRecords(user.id), getProfileRecord(user.id)]);
    const questionType = classifyQuestion(question);
    const normalizedQuestion = normalizeText(question);
    const reused = selectReusableAnswer(answers, {
      normalizedQuestion,
      questionType,
      company,
      role,
    });

    if (reused) {
      await incrementAnswerUsage(user.id, reused.id);
      return NextResponse.json({
        question_type: questionType,
        suggested_answer: reused.answer_text,
        reused_answer_id: reused.id,
        rationale: [
          "Question classified from common application patterns",
          "Answer bank lookup runs before calling an external LLM",
          reused.company_context
            ? `Reused a prior approved answer scoped to ${reused.company_context}`
            : "Reused a prior approved generic answer from the answer bank",
        ],
      });
    }

    const llmAnswer = await generateAnswerWithOpenRouter({ question, company, role, jobDescription, profile });
    if (llmAnswer) {
      return NextResponse.json({
        question_type: questionType,
        suggested_answer: llmAnswer,
        reused_answer_id: null,
        rationale: [
          "Question classified from common application patterns",
          "Answer bank lookup ran first",
          `Generated with OpenRouter model ${process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash"}`,
        ],
      });
    }

    const fallback =
      questionType === "motivation"
        ? `I'm interested in ${company || "this company"} because the role combines strong execution with meaningful product impact, which matches how I like to work.`
        : questionType === "project_example"
          ? "A project I'm proud of is building operational tools that combine structured data, workflow automation, and clear review checkpoints."
          : "This is a draft placeholder. Configure OpenRouter to ground answers in your profile and job context.";

    return NextResponse.json({
      question_type: questionType,
      suggested_answer: fallback,
      reused_answer_id: null,
      rationale: [
        "Question classified from common application patterns",
        "Answer bank lookup ran before LLM generation",
        "Returned deterministic fallback because no reusable answer or LLM response was available",
      ],
    });
  } catch (error) {
    return NextResponse.json({ detail: error instanceof Error ? error.message : "Draft generation failed." }, { status: 500 });
  }
}
