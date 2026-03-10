from app.core.logging import get_logger

logger = get_logger(__name__)


def audit_event(entity_type: str, entity_id: str, event_type: str, payload: dict | None = None) -> None:
    logger.info(
        "audit_event entity_type=%s entity_id=%s event_type=%s payload=%s",
        entity_type,
        entity_id,
        event_type,
        payload or {},
    )
