from sqlalchemy import JSON, Boolean, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class JobSource(Base):
    __tablename__ = "job_sources"

    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[str] = mapped_column(String(64))
    name: Mapped[str] = mapped_column(String(255))
    base_url: Mapped[str] = mapped_column(String(500), default="")
    keywords_json: Mapped[list] = mapped_column(JSON, default=list)
    companies_json: Mapped[list] = mapped_column(JSON, default=list)
    roles_json: Mapped[list] = mapped_column(JSON, default=list)
    locations_json: Mapped[list] = mapped_column(JSON, default=list)
    workplace_modes_json: Mapped[list] = mapped_column(JSON, default=list)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    last_checked_at: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
