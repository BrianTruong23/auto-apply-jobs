from app.services.discovery import DiscoveryService
from app.services.spreadsheet_sync import SpreadsheetSyncService
from app.schemas.source import DiscoveryRequest


def run_discovery_preview(payload: dict) -> dict:
    service = DiscoveryService()
    request = DiscoveryRequest(**payload)
    return {"task": "discovery_preview", "result": service.preview_discovery(request)}


def run_sync_preview() -> dict:
    service = SpreadsheetSyncService()
    return {"task": "spreadsheet_sync_preview", "result": service.preview_sync([])}
