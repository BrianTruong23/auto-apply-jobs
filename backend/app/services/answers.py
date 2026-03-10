from datetime import datetime, timezone
import json
from urllib import error, request

from sqlalchemy.orm import Session

from app.core.config import settings
from app.repositories.answers import AnswerRepository
from app.repositories.profile import ProfileRepository
from app.schemas.answer import DraftAnswerRequest, DraftAnswerResponse


class AnswerService:
    def __init__(self, repository: AnswerRepository):
        self.repository = repository
        self.profile_repository = ProfileRepository()

    def normalize_question(self, question: str) -> str:
        return " ".join(question.lower().replace("?", "").replace(".", "").split())

    def classify_question(self, question: str) -> str:
        lowered = question.lower()
        if "why" in lowered and "work" in lowered:
            return "motivation"
        if "project" in lowered or "proud" in lowered:
            return "project_example"
        if "strength" in lowered:
            return "strengths"
        return "general"

    def generate_with_openrouter(self, *, payload: DraftAnswerRequest, profile) -> str | None:
        if not settings.openrouter_api_key:
            return None

        system_prompt = (
            "You write concise, credible draft answers for job applications. "
            "Use only the provided profile and job context. "
            "Do not invent facts. Keep the answer practical and specific."
        )
        preferences = profile.preferences_json or {}
        user_prompt = {
            "question": payload.question,
            "company": payload.company,
            "role": payload.role,
            "job_description": payload.job_description,
            "candidate_profile": {
                "full_name": profile.full_name,
                "location": profile.location,
                "summary": profile.summary,
                "skills": preferences.get("skills", []),
                "preferred_roles": preferences.get("preferred_roles", []),
                "preferred_companies": preferences.get("preferred_companies", []),
                "resume_text": profile.resume_text,
            },
            "output_requirements": [
                "Return one polished draft answer",
                "Stay under 180 words",
                "No bullet points",
                "No fabricated achievements",
            ],
        }
        request_body = {
            "model": settings.openrouter_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps(user_prompt)},
            ],
        }
        req = request.Request(
            "https://openrouter.ai/api/v1/chat/completions",
            data=json.dumps(request_body).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {settings.openrouter_api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )

        try:
            with request.urlopen(req, timeout=30) as response:
                payload_json = json.loads(response.read().decode("utf-8"))
            content = payload_json["choices"][0]["message"]["content"].strip()
            return content or None
        except (error.URLError, TimeoutError, KeyError, IndexError, json.JSONDecodeError):
            return None

    def draft_answer(self, db: Session, payload: DraftAnswerRequest) -> DraftAnswerResponse:
        question_type = self.classify_question(payload.question)
        normalized_question = self.normalize_question(payload.question)
        reused = self.repository.find_reusable(db, question_type, normalized_question)
        profile = self.profile_repository.get_or_create_primary(db)
        rationale = [
            "Question classified from common application patterns",
            "Draft answer should be reviewed before use",
            "Answer bank lookup runs before calling an external LLM",
        ]

        if reused is not None:
            reused.usage_count += 1
            reused.last_used_at = datetime.now(timezone.utc)
            db.add(reused)
            db.commit()
            db.refresh(reused)
            return DraftAnswerResponse(
                question_type=question_type,
                suggested_answer=reused.answer_text,
                reused_answer_id=f"ans_{reused.id}",
                rationale=rationale + ["Reused a prior approved answer from the answer bank"],
            )

        llm_answer = self.generate_with_openrouter(payload=payload, profile=profile)
        if llm_answer is not None:
            return DraftAnswerResponse(
                question_type=question_type,
                suggested_answer=llm_answer,
                reused_answer_id=None,
                rationale=rationale + [f"Generated with OpenRouter model {settings.openrouter_model}"],
            )

        if question_type == "motivation":
            suggested = (
                f"I’m interested in {payload.company or 'this company'} because the role combines strong execution "
                "with meaningful product impact, which matches how I like to work."
            )
        elif question_type == "project_example":
            suggested = (
                "A project I’m proud of is building operational tools that combine structured data, workflow automation, "
                "and clear review checkpoints so the system remains reliable under real usage."
            )
        else:
            suggested = "This is a draft placeholder. In production, the answer service should ground responses in profile, resume, and prior approved answers."

        return DraftAnswerResponse(
            question_type=question_type,
            suggested_answer=suggested,
            reused_answer_id=None,
            rationale=rationale,
        )
