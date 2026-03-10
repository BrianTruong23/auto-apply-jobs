from app.schemas.job import JobListItem


class SpreadsheetSyncService:
    def preview_sync(self, jobs: list[JobListItem]) -> dict:
        return {
            "mode": "preview",
            "source_of_truth": "database",
            "target": "google_sheets",
            "rows": len(jobs),
            "columns": [
                "company",
                "role",
                "source",
                "job_url",
                "date_found",
                "fit_score",
                "status",
                "date_applied",
                "notes",
                "follow_up_date",
                "outcome",
            ],
            "idempotency": "row key should be application_id or job_id plus profile_id",
        }
