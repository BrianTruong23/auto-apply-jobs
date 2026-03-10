from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.repositories.answers import AnswerRepository
from app.schemas.answer import AnswerBankEntryCreate, AnswerBankEntryRead, DraftAnswerRequest, DraftAnswerResponse
from app.services.answers import AnswerService
from app.services.audit import audit_event

router = APIRouter()
repository = AnswerRepository()


@router.get("", response_model=list[AnswerBankEntryRead])
def list_answers(db: Session = Depends(get_db)) -> list[AnswerBankEntryRead]:
    audit_event("answer_bank", "list", "answers.list")
    rows = repository.list_answers(db)
    if not rows:
        for example in AnswerBankEntryRead.examples():
            repository.create(
                db,
                AnswerBankEntryCreate(
                    question_type=example.question_type,
                    normalized_question=example.normalized_question,
                    answer_text=example.answer_text,
                    evidence=[],
                ),
            )
        rows = repository.list_answers(db)
    return [repository.to_read(item) for item in rows]


@router.post("", response_model=AnswerBankEntryRead)
def create_answer(payload: AnswerBankEntryCreate, db: Session = Depends(get_db)) -> AnswerBankEntryRead:
    row = repository.create(db, payload)
    audit_event("answer_bank", str(row.id), "answer.created")
    return repository.to_read(row)


@router.post("/draft", response_model=DraftAnswerResponse)
def draft_answer(payload: DraftAnswerRequest, db: Session = Depends(get_db)) -> DraftAnswerResponse:
    service = AnswerService(repository)
    response = service.draft_answer(db, payload)
    audit_event("application_question", "draft", "answers.draft", response.model_dump())
    return response
