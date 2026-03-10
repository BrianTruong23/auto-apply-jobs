from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.repositories.applications import ApplicationRepository
from app.repositories.jobs import JobRepository
from app.schemas.application import ApplicationCreate, ApplicationRead
from app.services.audit import audit_event

router = APIRouter()
repository = ApplicationRepository()
job_repository = JobRepository()


@router.get("", response_model=list[ApplicationRead])
def list_applications(db: Session = Depends(get_db)) -> list[ApplicationRead]:
    rows = repository.list_applications(db)
    if not rows:
        items = ApplicationRead.examples()
        audit_event("application", "list", "applications.list", {"count": len(items), "source": "examples"})
        return items

    items = [repository.to_read(app, job) for app, job in rows]
    audit_event("application", "list", "applications.list", {"count": len(items)})
    return items


@router.post("", response_model=ApplicationRead)
def create_application(payload: ApplicationCreate, db: Session = Depends(get_db)) -> ApplicationRead:
    if not payload.job_id.startswith("job_"):
        raise HTTPException(status_code=400, detail="job_id must start with job_")

    job_id = int(payload.job_id.split("_", 1)[1])
    jobs = {job.id: job for job in job_repository.list_jobs(db)}
    job = jobs.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="job not found")

    row = repository.create(db, payload, resolved_job_id=job_id)
    audit_event("application", str(row.id), "application.created")
    return repository.to_read(row, job)
