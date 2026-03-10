from sqlalchemy import JSON, DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class RunLog(Base):
    __tablename__ = "run_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    run_type: Mapped[str] = mapped_column(String(64))
    status: Mapped[str] = mapped_column(String(64))
    summary: Mapped[str] = mapped_column(Text, default="")
    payload_json: Mapped[dict] = mapped_column(JSON, default=dict)
    started_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    finished_at: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
