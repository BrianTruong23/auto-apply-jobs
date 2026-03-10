from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.answer_bank import AnswerBankEntry
from app.schemas.answer import AnswerBankEntryCreate, AnswerBankEntryRead


class AnswerRepository:
    def list_answers(self, db: Session) -> list[AnswerBankEntry]:
        return list(db.scalars(select(AnswerBankEntry).order_by(AnswerBankEntry.usage_count.desc(), AnswerBankEntry.id.asc())))

    def create(self, db: Session, payload: AnswerBankEntryCreate, profile_id: int = 1) -> AnswerBankEntry:
        row = AnswerBankEntry(
            profile_id=profile_id,
            question_type=payload.question_type,
            normalized_question=payload.normalized_question,
            answer_text=payload.answer_text,
            evidence_json=payload.evidence,
        )
        db.add(row)
        db.commit()
        db.refresh(row)
        return row

    def find_reusable(self, db: Session, question_type: str, normalized_question: str) -> AnswerBankEntry | None:
        items = self.list_answers(db)
        for item in items:
            if item.question_type == question_type and item.normalized_question == normalized_question:
                return item
        for item in items:
            if item.question_type == question_type:
                return item
        return None

    def to_read(self, row: AnswerBankEntry) -> AnswerBankEntryRead:
        return AnswerBankEntryRead(
            id=f"ans_{row.id}",
            question_type=row.question_type,
            normalized_question=row.normalized_question,
            answer_text=row.answer_text,
            usage_count=row.usage_count,
            last_used_at=row.last_used_at.isoformat() if row.last_used_at else None,
        )
