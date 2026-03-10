from pydantic import BaseModel


class JobListItem(BaseModel):
    id: str
    company: str
    title: str
    location: str
    workplace_mode: str
    status: str
    fit_score: float
    source: str
    source_url: str
    application_url: str
    posted_at: str | None = None
    explanation: list[str] = []

    @classmethod
    def examples(cls) -> list["JobListItem"]:
        return [
            cls(
                id="job_1",
                company="OpenAI",
                title="Software Engineer, Applied AI",
                location="San Francisco, CA",
                workplace_mode="hybrid",
                status="shortlisted",
                fit_score=92,
                source="Brave Search",
                source_url="https://example.com/jobs/openai-applied-ai",
                application_url="https://example.com/apply/openai-applied-ai",
                posted_at="2026-03-08T00:00:00Z",
                explanation=["Strong title match", "Company is preferred", "Relevant AI workflow skills"],
            ),
            cls(
                id="job_2",
                company="Stripe",
                title="Full Stack Engineer, Growth",
                location="Remote - US",
                workplace_mode="remote",
                status="discovered",
                fit_score=84,
                source="Manual URL",
                source_url="https://example.com/jobs/stripe-growth",
                application_url="https://example.com/apply/stripe-growth",
                posted_at="2026-03-07T00:00:00Z",
                explanation=["Strong full-stack overlap", "Remote preference match"],
            ),
        ]


class JobCreate(BaseModel):
    canonical_key: str
    company: str
    title: str
    location: str
    workplace_mode: str
    status: str = "discovered"
    fit_score: float = 0
    source: str
    source_url: str
    application_url: str
    posted_at: str | None = None
    explanation: list[str] = []
    description_text: str = ""
    raw_payload: dict = {}
    normalized_payload: dict = {}
