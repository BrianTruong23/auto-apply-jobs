from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.repositories.jobs import JobRepository
from app.schemas.job import JobListItem
from app.services.audit import audit_event

router = APIRouter()
repository = JobRepository()


@router.get("", response_model=list[JobListItem])
def list_jobs(db: Session = Depends(get_db)) -> list[JobListItem]:
    rows = repository.list_jobs(db)
    if not rows:
        items = JobListItem.examples()
        audit_event("job", "list", "jobs.list", {"count": len(items), "source": "examples"})
        return items

    items = [repository.to_read(item) for item in rows]
    audit_event("job", "list", "jobs.list", {"count": len(items), "source": "database"})
    return items
