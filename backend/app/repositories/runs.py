from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.run_log import RunLog
from app.schemas.run import RunLogRead


class RunLogRepository:
    def list_runs(self, db: Session) -> list[RunLog]:
        return list(db.scalars(select(RunLog).order_by(RunLog.id.desc())))

    def create(
        self,
        db: Session,
        *,
        run_type: str,
        status: str,
        summary: str,
        payload: dict | None = None,
        finished_at: datetime | None = None,
    ) -> RunLog:
        row = RunLog(
            run_type=run_type,
            status=status,
            summary=summary,
            payload_json=payload or {},
            finished_at=finished_at or datetime.now(timezone.utc),
        )
        db.add(row)
        db.commit()
        db.refresh(row)
        return row

    def to_read(self, row: RunLog) -> RunLogRead:
        return RunLogRead(
            id=f"run_{row.id}",
            run_type=row.run_type,
            status=row.status,
            started_at=row.started_at.isoformat(),
            finished_at=row.finished_at.isoformat() if row.finished_at else None,
            summary=row.summary,
        )
