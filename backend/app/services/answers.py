from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.repositories.answers import AnswerRepository
from app.schemas.answer import DraftAnswerRequest, DraftAnswerResponse


class AnswerService:
    def __init__(self, repository: AnswerRepository):
        self.repository = repository

    def normalize_question(self, question: str) -> str:
        return " ".join(question.lower().replace("?", "").replace(".", "").split())

    def classify_question(self, question: str) -> str:
        lowered = question.lower()
        if "why" in lowered and "work" in lowered:
            return "motivation"
        if "project" in lowered or "proud" in lowered:
            return "project_example"
        if "strength" in lowered:
            return "strengths"
        return "general"

    def draft_answer(self, db: Session, payload: DraftAnswerRequest) -> DraftAnswerResponse:
        question_type = self.classify_question(payload.question)
        normalized_question = self.normalize_question(payload.question)
        reused = self.repository.find_reusable(db, question_type, normalized_question)
        rationale = [
            "Question classified from common application patterns",
            "Draft answer should be reviewed before use",
            "Answer bank lookup runs before calling an external LLM",
        ]

        if reused is not None:
            reused.usage_count += 1
            reused.last_used_at = datetime.now(timezone.utc)
            db.add(reused)
            db.commit()
            db.refresh(reused)
            return DraftAnswerResponse(
                question_type=question_type,
                suggested_answer=reused.answer_text,
                reused_answer_id=f"ans_{reused.id}",
                rationale=rationale + ["Reused a prior approved answer from the answer bank"],
            )

        if question_type == "motivation":
            suggested = (
                f"I’m interested in {payload.company or 'this company'} because the role combines strong execution "
                "with meaningful product impact, which matches how I like to work."
            )
        elif question_type == "project_example":
            suggested = (
                "A project I’m proud of is building operational tools that combine structured data, workflow automation, "
                "and clear review checkpoints so the system remains reliable under real usage."
            )
        else:
            suggested = "This is a draft placeholder. In production, the answer service should ground responses in profile, resume, and prior approved answers."

        return DraftAnswerResponse(
            question_type=question_type,
            suggested_answer=suggested,
            reused_answer_id=None,
            rationale=rationale,
        )
