from app.schemas.job import JobListItem


class FitScoringService:
    def attach_default_explanation(self, job: JobListItem) -> JobListItem:
        if job.explanation:
            return job

        explanation = []
        if "engineer" in job.title.lower():
            explanation.append("Title aligns with preferred engineering roles")
        if "remote" in job.location.lower() or job.workplace_mode == "remote":
            explanation.append("Matches remote work preference")
        if job.company in {"OpenAI", "Stripe", "Notion"}:
            explanation.append("Company is on preferred target list")

        job.explanation = explanation or ["Initial score is awaiting deeper profile matching"]
        return job

    def score_job(self, *, title: str, company: str, location: str, workplace_mode: str, profile) -> tuple[float, list[str]]:
        preferences = profile.preferences_json or {}
        preferred_roles = [item.lower() for item in preferences.get("preferred_roles", [])]
        preferred_locations = [item.lower() for item in preferences.get("preferred_locations", [])]
        preferred_companies = [item.lower() for item in preferences.get("preferred_companies", [])]
        skills = [item.lower() for item in preferences.get("skills", [])]

        score = 0.0
        explanation: list[str] = []
        title_lower = title.lower()
        company_lower = company.lower()
        location_lower = location.lower()
        workplace_mode_lower = workplace_mode.lower()

        if any(role in title_lower for role in preferred_roles):
            score += 35
            explanation.append("Title aligns with preferred roles")
        if company_lower in preferred_companies:
            score += 20
            explanation.append("Company is on preferred list")
        if any(loc in location_lower for loc in preferred_locations) or workplace_mode_lower in preferred_locations:
            score += 20
            explanation.append("Location or workplace mode matches preference")
        if any(skill in title_lower for skill in skills):
            score += 10
            explanation.append("Role title overlaps with profile skills")
        if "senior" not in title_lower and "staff" not in title_lower:
            score += 10
            explanation.append("Seniority appears broadly compatible")

        return min(score, 100.0), explanation or ["Needs deeper comparison with profile and resume"]
