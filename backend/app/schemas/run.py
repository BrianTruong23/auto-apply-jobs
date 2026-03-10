from pydantic import BaseModel


class RunLogRead(BaseModel):
    id: str
    run_type: str
    status: str
    started_at: str
    finished_at: str | None = None
    summary: str

    @classmethod
    def examples(cls) -> list["RunLogRead"]:
        return [
            cls(
                id="run_1",
                run_type="discovery",
                status="succeeded",
                started_at="2026-03-10T10:00:00Z",
                finished_at="2026-03-10T10:02:00Z",
                summary="Brave discovery found 12 jobs, 4 new after deduplication.",
            ),
            cls(
                id="run_2",
                run_type="spreadsheet_sync",
                status="partial",
                started_at="2026-03-10T10:05:00Z",
                finished_at="2026-03-10T10:05:20Z",
                summary="Updated 9 rows; 1 row skipped due to missing spreadsheet mapping.",
            ),
        ]
