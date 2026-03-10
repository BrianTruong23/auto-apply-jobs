from sqlalchemy import JSON, DateTime, Float, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(primary_key=True)
    canonical_key: Mapped[str] = mapped_column(String(255), unique=True)
    company_name: Mapped[str] = mapped_column(String(255))
    title: Mapped[str] = mapped_column(String(255))
    location_text: Mapped[str] = mapped_column(String(255), default="")
    workplace_mode: Mapped[str] = mapped_column(String(64), default="unknown")
    description_text: Mapped[str] = mapped_column(Text, default="")
    source_url: Mapped[str] = mapped_column(String(500), default="")
    application_url: Mapped[str] = mapped_column(String(500), default="")
    source_type: Mapped[str] = mapped_column(String(64), default="")
    status: Mapped[str] = mapped_column(String(64), default="discovered")
    fit_score: Mapped[float] = mapped_column(Float, default=0.0)
    fit_explanation_json: Mapped[list] = mapped_column(JSON, default=list)
    raw_payload_json: Mapped[dict] = mapped_column(JSON, default=dict)
    normalized_payload_json: Mapped[dict] = mapped_column(JSON, default=dict)
    posted_at: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
