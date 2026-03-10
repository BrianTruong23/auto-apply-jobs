from sqlalchemy import JSON, DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AnswerBankEntry(Base):
    __tablename__ = "answer_bank_entries"

    id: Mapped[int] = mapped_column(primary_key=True)
    profile_id: Mapped[int] = mapped_column(index=True)
    question_type: Mapped[str] = mapped_column(String(128))
    normalized_question: Mapped[str] = mapped_column(String(500))
    answer_text: Mapped[str] = mapped_column(Text)
    evidence_json: Mapped[list] = mapped_column(JSON, default=list)
    usage_count: Mapped[int] = mapped_column(default=0)
    last_used_at: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
