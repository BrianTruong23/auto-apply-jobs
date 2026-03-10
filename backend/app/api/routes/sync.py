from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.repositories.jobs import JobRepository
from app.repositories.runs import RunLogRepository
from app.services.audit import audit_event
from app.services.spreadsheet_sync import SpreadsheetSyncService

router = APIRouter()
job_repository = JobRepository()
run_repository = RunLogRepository()


@router.post("/spreadsheet")
def sync_spreadsheet(db: Session = Depends(get_db)) -> dict:
    service = SpreadsheetSyncService()
    jobs = [job_repository.to_read(item) for item in job_repository.list_jobs(db)]
    result = service.preview_sync(jobs)
    run_repository.create(
        db,
        run_type="spreadsheet_sync",
        status="succeeded",
        summary=f"Prepared spreadsheet sync preview for {result['rows']} jobs.",
        payload=result,
    )
    audit_event("spreadsheet_sync_run", "preview", "sync.spreadsheet_preview", result)
    return result
