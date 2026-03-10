from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(primary_key=True)
    job_id: Mapped[int] = mapped_column(index=True)
    status: Mapped[str] = mapped_column(String(64), default="discovered")
    outcome: Mapped[str] = mapped_column(String(64), default="")
    current_step: Mapped[str] = mapped_column(String(128), default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    date_applied: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    follow_up_date: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
