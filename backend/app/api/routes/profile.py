from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.repositories.profile import ProfileRepository
from app.schemas.profile import ProfileRead, ProfileUpsert
from app.services.audit import audit_event

router = APIRouter()
repository = ProfileRepository()


@router.get("", response_model=ProfileRead)
def get_profile(db: Session = Depends(get_db)) -> ProfileRead:
    audit_event("profile", "singleton", "profile.read")
    return repository.to_read(repository.get_or_create_primary(db))


@router.put("", response_model=ProfileRead)
def update_profile(payload: ProfileUpsert, db: Session = Depends(get_db)) -> ProfileRead:
    row = repository.upsert_primary(db, payload)
    audit_event("profile", str(row.id), "profile.updated")
    return repository.to_read(row)
