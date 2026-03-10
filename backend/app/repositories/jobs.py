from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.job import Job
from app.schemas.job import JobCreate, JobListItem


class JobRepository:
    def list_jobs(self, db: Session) -> list[Job]:
        return list(db.scalars(select(Job).order_by(Job.fit_score.desc(), Job.id.desc())))

    def get_by_canonical_key(self, db: Session, canonical_key: str) -> Job | None:
        return db.scalar(select(Job).where(Job.canonical_key == canonical_key))

    def create_or_update_by_canonical_key(self, db: Session, payload: JobCreate) -> tuple[Job, bool]:
        row = self.get_by_canonical_key(db, payload.canonical_key)
        created = False
        if row is None:
            row = Job(canonical_key=payload.canonical_key)
            created = True

        row.company_name = payload.company
        row.title = payload.title
        row.location_text = payload.location
        row.workplace_mode = payload.workplace_mode
        row.description_text = payload.description_text
        row.source_url = payload.source_url
        row.application_url = payload.application_url
        row.source_type = payload.source
        row.status = payload.status
        row.fit_score = payload.fit_score
        row.fit_explanation_json = payload.explanation
        row.raw_payload_json = payload.raw_payload
        row.normalized_payload_json = payload.normalized_payload
        row.posted_at = datetime.fromisoformat(payload.posted_at.replace("Z", "+00:00")) if payload.posted_at else None
        db.add(row)
        db.commit()
        db.refresh(row)
        return row, created

    def to_read(self, row: Job) -> JobListItem:
        return JobListItem(
            id=f"job_{row.id}",
            company=row.company_name,
            title=row.title,
            location=row.location_text,
            workplace_mode=row.workplace_mode,
            status=row.status,
            fit_score=row.fit_score,
            source=row.source_type,
            source_url=row.source_url,
            application_url=row.application_url,
            posted_at=row.posted_at.isoformat() if row.posted_at else None,
            explanation=row.fit_explanation_json or [],
        )
