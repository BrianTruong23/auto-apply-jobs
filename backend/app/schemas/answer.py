from pydantic import BaseModel


class AnswerBankEntryRead(BaseModel):
    id: str
    question_type: str
    normalized_question: str
    answer_text: str
    usage_count: int
    last_used_at: str | None = None

    @classmethod
    def examples(cls) -> list["AnswerBankEntryRead"]:
        return [
            cls(
                id="ans_1",
                question_type="motivation",
                normalized_question="why do you want to work here",
                answer_text="I want to work on products where strong engineering directly improves how people make decisions.",
                usage_count=8,
                last_used_at="2026-03-09T14:00:00Z",
            ),
            cls(
                id="ans_2",
                question_type="project_example",
                normalized_question="describe a project you are proud of",
                answer_text="I built workflow systems that combined structured data, automation, and review checkpoints.",
                usage_count=5,
                last_used_at="2026-03-05T12:00:00Z",
            ),
        ]


class DraftAnswerRequest(BaseModel):
    question: str
    company: str | None = None
    role: str | None = None
    job_description: str | None = None


class DraftAnswerResponse(BaseModel):
    question_type: str
    suggested_answer: str
    reused_answer_id: str | None = None
    rationale: list[str]


class AnswerBankEntryCreate(BaseModel):
    question_type: str
    normalized_question: str
    answer_text: str
    evidence: list[str] = []
