from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.job_source import JobSource
from app.schemas.source import JobSourceCreate, JobSourceRead


class JobSourceRepository:
    def list_sources(self, db: Session) -> list[JobSource]:
        return list(db.scalars(select(JobSource).order_by(JobSource.id.desc())))

    def create(self, db: Session, payload: JobSourceCreate) -> JobSource:
        row = JobSource(
            type=payload.type,
            name=payload.name,
            base_url=payload.base_url or "",
            keywords_json=payload.keywords,
            companies_json=payload.companies,
            roles_json=payload.roles,
            locations_json=payload.locations,
            workplace_modes_json=payload.workplace_modes,
            enabled=payload.enabled,
        )
        db.add(row)
        db.commit()
        db.refresh(row)
        return row

    def to_read(self, row: JobSource) -> JobSourceRead:
        return JobSourceRead(
            id=f"src_{row.id}",
            name=row.name,
            type=row.type,
            base_url=row.base_url or None,
            keywords=row.keywords_json or [],
            companies=row.companies_json or [],
            roles=row.roles_json or [],
            locations=row.locations_json or [],
            workplace_modes=row.workplace_modes_json or [],
            enabled=row.enabled,
            last_checked_at=row.last_checked_at.isoformat() if row.last_checked_at else None,
        )
