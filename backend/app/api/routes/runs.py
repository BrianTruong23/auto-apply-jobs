from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.repositories.runs import RunLogRepository
from app.schemas.run import RunLogRead
from app.services.audit import audit_event

router = APIRouter()
repository = RunLogRepository()


@router.get("", response_model=list[RunLogRead])
def list_runs(db: Session = Depends(get_db)) -> list[RunLogRead]:
    rows = repository.list_runs(db)
    if not rows:
        items = RunLogRead.examples()
        audit_event("run", "list", "runs.list", {"count": len(items), "source": "examples"})
        return items

    items = [repository.to_read(item) for item in rows]
    audit_event("run", "list", "runs.list", {"count": len(items), "source": "database"})
    return items
