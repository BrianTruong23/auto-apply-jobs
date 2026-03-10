from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.application import Application
from app.models.job import Job
from app.schemas.application import ApplicationCreate, ApplicationRead


class ApplicationRepository:
    def list_applications(self, db: Session) -> list[tuple[Application, Job | None]]:
        rows = db.execute(select(Application, Job).join(Job, Application.job_id == Job.id, isouter=True)).all()
        return [(application, job) for application, job in rows]

    def create(self, db: Session, payload: ApplicationCreate, resolved_job_id: int) -> Application:
        row = Application(
            job_id=resolved_job_id,
            status=payload.status,
            current_step=payload.current_step,
            outcome=payload.outcome or "",
            notes=payload.notes,
        )
        db.add(row)
        db.commit()
        db.refresh(row)
        return row

    def to_read(self, row: Application, job: Job | None) -> ApplicationRead:
        return ApplicationRead(
            id=f"app_{row.id}",
            job_id=f"job_{row.job_id}",
            company=job.company_name if job else "Unknown",
            title=job.title if job else "Unknown",
            status=row.status,
            current_step=row.current_step,
            outcome=row.outcome or None,
            notes=row.notes,
        )
