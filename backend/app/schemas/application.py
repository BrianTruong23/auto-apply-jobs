from pydantic import BaseModel


class ApplicationRead(BaseModel):
    id: str
    job_id: str
    company: str
    title: str
    status: str
    current_step: str
    outcome: str | None = None
    notes: str

    @classmethod
    def examples(cls) -> list["ApplicationRead"]:
        return [
            cls(
                id="app_1",
                job_id="job_1",
                company="OpenAI",
                title="Software Engineer, Applied AI",
                status="preparing",
                current_step="Review tailored resume and short-answer draft",
                outcome=None,
                notes="Need to tailor project bullets toward workflow automation.",
            )
        ]


class ApplicationCreate(BaseModel):
    job_id: str
    status: str = "preparing"
    current_step: str = ""
    outcome: str | None = None
    notes: str = ""
