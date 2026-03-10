from pydantic import BaseModel


class JobSourceRead(BaseModel):
    id: str
    name: str
    type: str
    base_url: str | None = None
    keywords: list[str]
    companies: list[str]
    roles: list[str]
    locations: list[str]
    workplace_modes: list[str]
    enabled: bool
    last_checked_at: str | None = None

    @classmethod
    def examples(cls) -> list["JobSourceRead"]:
        return [
            cls(
                id="src_1",
                name="AI Product Roles",
                type="search_keyword",
                base_url=None,
                keywords=["software engineer ai", "full stack engineer llm"],
                companies=["OpenAI", "Anthropic"],
                roles=["Software Engineer"],
                locations=["Remote", "New York, NY"],
                workplace_modes=["remote", "hybrid"],
                enabled=True,
                last_checked_at="2026-03-10T10:15:00Z",
            ),
            cls(
                id="src_2",
                name="Stripe Careers",
                type="company_page",
                base_url="https://stripe.com/jobs/search",
                keywords=[],
                companies=["Stripe"],
                roles=["Backend Engineer"],
                locations=["Remote"],
                workplace_modes=["remote"],
                enabled=False,
                last_checked_at=None,
            ),
        ]


class DiscoveryRequest(BaseModel):
    keywords: list[str]
    companies: list[str] = []
    locations: list[str] = []
    workplace_modes: list[str] = []
    manual_urls: list[str] = []


class JobSourceCreate(BaseModel):
    name: str
    type: str
    base_url: str | None = None
    keywords: list[str] = []
    companies: list[str] = []
    roles: list[str] = []
    locations: list[str] = []
    workplace_modes: list[str] = []
    enabled: bool = True
