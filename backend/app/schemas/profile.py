from pydantic import BaseModel, EmailStr


class ProfileRead(BaseModel):
    id: str
    full_name: str
    email: str
    location: str
    summary: str
    preferred_roles: list[str]
    preferred_locations: list[str]
    preferred_companies: list[str]
    skills: list[str]

    @classmethod
    def example(cls) -> "ProfileRead":
        return cls(
            id="profile_1",
            full_name="Alex Candidate",
            email="alex@example.com",
            location="New York, NY",
            summary="Product-minded software engineer focused on AI-enabled workflow tools.",
            preferred_roles=["Software Engineer", "Full Stack Engineer", "AI Product Engineer"],
            preferred_locations=["New York, NY", "Remote"],
            preferred_companies=["OpenAI", "Stripe", "Notion"],
            skills=["Python", "TypeScript", "Next.js", "FastAPI", "Postgres", "Playwright"],
        )


class ProfileUpsert(BaseModel):
    full_name: str
    email: EmailStr
    location: str
    summary: str
    resume_text: str = ""
    preferred_roles: list[str] = []
    preferred_locations: list[str] = []
    preferred_companies: list[str] = []
    skills: list[str] = []
