from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.repositories.jobs import JobRepository
from app.repositories.runs import RunLogRepository
from app.repositories.sources import JobSourceRepository
from app.schemas.source import DiscoveryRequest, JobSourceCreate, JobSourceRead
from app.services.audit import audit_event
from app.services.discovery import DiscoveryService

router = APIRouter()
source_repository = JobSourceRepository()
job_repository = JobRepository()
run_repository = RunLogRepository()


@router.get("", response_model=list[JobSourceRead])
def list_sources(db: Session = Depends(get_db)) -> list[JobSourceRead]:
    audit_event("job_source", "list", "sources.list")
    rows = source_repository.list_sources(db)
    if not rows:
        for example in JobSourceRead.examples():
            source_repository.create(
                db,
                JobSourceCreate(
                    name=example.name,
                    type=example.type,
                    base_url=example.base_url,
                    keywords=example.keywords,
                    companies=example.companies,
                    roles=example.roles,
                    locations=example.locations,
                    workplace_modes=example.workplace_modes,
                    enabled=example.enabled,
                ),
            )
        rows = source_repository.list_sources(db)
    return [source_repository.to_read(item) for item in rows]


@router.post("", response_model=JobSourceRead)
def create_source(payload: JobSourceCreate, db: Session = Depends(get_db)) -> JobSourceRead:
    row = source_repository.create(db, payload)
    audit_event("job_source", str(row.id), "source.created")
    return source_repository.to_read(row)


@router.post("/discover")
def discover_jobs(payload: DiscoveryRequest, db: Session = Depends(get_db)) -> dict:
    service = DiscoveryService()
    result = service.run_discovery(payload, db=db, job_repository=job_repository, run_repository=run_repository)
    audit_event("source_run", result["run_id"], "sources.discover", result)
    return result
