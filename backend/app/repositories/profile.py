from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.profile import Profile
from app.schemas.profile import ProfileRead, ProfileUpsert


class ProfileRepository:
    def get_primary(self, db: Session) -> Profile | None:
        return db.scalar(select(Profile).order_by(Profile.id.asc()).limit(1))

    def get_or_create_primary(self, db: Session) -> Profile:
        existing = self.get_primary(db)
        if existing is not None:
            return existing

        row = Profile(
            full_name="Alex Candidate",
            email="alex@example.com",
            location="New York, NY",
            summary="Product-minded software engineer focused on AI-enabled workflow tools.",
            resume_text="",
            preferences_json={
                "preferred_roles": ["Software Engineer", "Full Stack Engineer", "AI Product Engineer"],
                "preferred_locations": ["New York, NY", "Remote"],
                "preferred_companies": ["OpenAI", "Stripe", "Notion"],
                "skills": ["Python", "TypeScript", "Next.js", "FastAPI", "Postgres", "Playwright"],
            },
        )
        db.add(row)
        db.commit()
        db.refresh(row)
        return row

    def upsert_primary(self, db: Session, payload: ProfileUpsert) -> Profile:
        row = self.get_or_create_primary(db)
        row.full_name = payload.full_name
        row.email = payload.email
        row.location = payload.location
        row.summary = payload.summary
        row.resume_text = payload.resume_text
        row.preferences_json = {
            "preferred_roles": payload.preferred_roles,
            "preferred_locations": payload.preferred_locations,
            "preferred_companies": payload.preferred_companies,
            "skills": payload.skills,
        }
        db.add(row)
        db.commit()
        db.refresh(row)
        return row

    def to_read(self, row: Profile) -> ProfileRead:
        preferences = row.preferences_json or {}
        return ProfileRead(
            id=f"profile_{row.id}",
            full_name=row.full_name,
            email=row.email,
            location=row.location,
            summary=row.summary,
            preferred_roles=preferences.get("preferred_roles", []),
            preferred_locations=preferences.get("preferred_locations", []),
            preferred_companies=preferences.get("preferred_companies", []),
            skills=preferences.get("skills", []),
        )
