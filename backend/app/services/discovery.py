import json
from datetime import datetime, timezone
from urllib import error, parse, request

from sqlalchemy.orm import Session

from app.core.config import settings
from app.repositories.profile import ProfileRepository
from app.schemas.job import JobCreate
from app.schemas.source import DiscoveryRequest
from app.services.parsing import JobParsingService
from app.services.scoring import FitScoringService


class DiscoveryService:
    search_endpoint = "https://api.search.brave.com/res/v1/web/search"

    def __init__(self) -> None:
        self.parsing = JobParsingService()
        self.scoring = FitScoringService()
        self.profile_repository = ProfileRepository()

    def preview_discovery(self, payload: DiscoveryRequest) -> dict:
        query_parts = payload.keywords + payload.companies + payload.locations + payload.workplace_modes
        return {
            "mode": "preview",
            "provider": "brave_search",
            "query_terms": query_parts,
            "manual_urls": payload.manual_urls,
            "steps": [
                "build query from source preferences",
                "fetch search results from Brave Search API",
                "parse candidate pages into normalized jobs",
                "deduplicate against canonical jobs",
                "score fit and persist audit trail",
            ],
        }

    def run_discovery(self, payload: DiscoveryRequest, *, db: Session, job_repository, run_repository) -> dict:
        profile = self.profile_repository.get_or_create_primary(db)
        query = self._build_query(payload)
        used_fallback = False
        error_message: str | None = None

        try:
            brave_payload = self._search_brave(query)
        except (RuntimeError, error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            brave_payload = None
            used_fallback = True
            error_message = str(exc)

        candidates = self._extract_jobs(payload, brave_payload)
        created_count = 0
        jobs = []

        for item in candidates:
            title = item.get("title") or (payload.keywords[0].title() if payload.keywords else "Software Engineer")
            company = self._infer_company(payload, item)
            location = self._infer_location(payload, item)
            workplace_mode = self._infer_workplace_mode(payload, item)
            fit_score, explanation = self.scoring.score_job(
                title=title,
                company=company,
                location=location,
                workplace_mode=workplace_mode,
                profile=profile,
            )
            row, created = job_repository.create_or_update_by_canonical_key(
                db,
                JobCreate(
                    canonical_key=self.parsing.canonical_key(company, title, location),
                    company=company,
                    title=title,
                    location=location,
                    workplace_mode=workplace_mode,
                    source="Brave Search" if not used_fallback else "Discovery Fallback",
                    source_url=item.get("url", ""),
                    application_url=item.get("url", ""),
                    fit_score=fit_score,
                    explanation=explanation,
                    posted_at=datetime.now(timezone.utc).isoformat(),
                    description_text=item.get("description", ""),
                    raw_payload=item,
                    normalized_payload={
                        "company": company,
                        "title": title,
                        "location": location,
                        "workplace_mode": workplace_mode,
                    },
                ),
            )
            if created:
                created_count += 1
            jobs.append(job_repository.to_read(row).model_dump())

        summary = (
            f"Discovery processed {len(candidates)} results, created {created_count} jobs, "
            f"updated {len(candidates) - created_count} existing jobs."
        )
        run = run_repository.create(
            db,
            run_type="discovery",
            status="partial" if used_fallback else "succeeded",
            summary=summary,
            payload={"query": query, "error": error_message, "fallback": used_fallback},
        )
        return {
            "query": query,
            "used_fallback": used_fallback,
            "error": error_message,
            "created": created_count,
            "total_processed": len(candidates),
            "run_id": f"run_{run.id}",
            "jobs": jobs,
        }

    def _build_query(self, payload: DiscoveryRequest) -> str:
        terms = payload.keywords + payload.companies + payload.locations + payload.workplace_modes + ["jobs"]
        return " ".join(part for part in terms if part).strip()

    def _search_brave(self, query: str) -> dict:
        if not settings.brave_search_api_key:
            raise RuntimeError("BRAVE_SEARCH_API_KEY is not configured")

        url = f"{self.search_endpoint}?{parse.urlencode({'q': query, 'count': 10, 'search_lang': 'en'})}"
        req = request.Request(
            url,
            headers={
                "Accept": "application/json",
                "X-Subscription-Token": settings.brave_search_api_key,
            },
        )
        with request.urlopen(req, timeout=20) as response:
            return json.loads(response.read().decode("utf-8"))

    def _extract_jobs(self, payload: DiscoveryRequest, brave_payload: dict | None) -> list[dict]:
        manual_rows = [
            {
                "title": payload.keywords[0].title() if payload.keywords else "Software Engineer",
                "url": url,
                "description": f"Manual URL ingestion for {url}",
                "meta_url": {"hostname": parse.urlparse(url).netloc},
            }
            for url in payload.manual_urls
        ]
        brave_rows = brave_payload.get("web", {}).get("results", []) if brave_payload else []
        rows = brave_rows + manual_rows
        return rows or self._fallback_results(payload)

    def _fallback_results(self, payload: DiscoveryRequest) -> list[dict]:
        role = payload.keywords[0] if payload.keywords else "software engineer"
        company = payload.companies[0] if payload.companies else "Example Company"
        location = payload.locations[0] if payload.locations else "Remote"
        return [
            {
                "title": role.title(),
                "url": payload.manual_urls[0] if payload.manual_urls else "https://example.com/jobs/example-role",
                "description": f"{company} is hiring a {role} in {location}.",
                "meta_url": {"hostname": "example.com"},
            }
        ]

    def _infer_company(self, payload: DiscoveryRequest, item: dict) -> str:
        if payload.companies:
            return payload.companies[0]
        hostname = item.get("meta_url", {}).get("hostname", "")
        return hostname.split(".")[0].replace("-", " ").title() if hostname else "Unknown Company"

    def _infer_location(self, payload: DiscoveryRequest, item: dict) -> str:
        description = (item.get("description") or "").lower()
        if "remote" in description:
            return "Remote"
        return payload.locations[0] if payload.locations else "Unknown"

    def _infer_workplace_mode(self, payload: DiscoveryRequest, item: dict) -> str:
        description = (item.get("description") or "").lower()
        if "hybrid" in description:
            return "hybrid"
        if "remote" in description:
            return "remote"
        return payload.workplace_modes[0] if payload.workplace_modes else "unknown"
