import os
from pathlib import Path
from typing import Any
from uuid import UUID

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
MEETINGS_TABLE = "meetings"

_supabase_client: Client | None = None


def get_supabase_client() -> Client:
    global _supabase_client

    if _supabase_client is not None:
        return _supabase_client

    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError(
            "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend environment."
        )

    _supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    return _supabase_client


def update_meeting_processing(meeting_id: UUID) -> None:
    _update_meeting(meeting_id, {"status": "processing"})


def update_meeting_completed(meeting_id: UUID, transcript: str, summary: str) -> None:
    _update_meeting(
        meeting_id,
        {
            "status": "completed",
            "summary": summary,
            "transcript": transcript,
        },
    )


def update_meeting_failed(meeting_id: UUID) -> None:
    _update_meeting(meeting_id, {"status": "failed"})


def _update_meeting(meeting_id: UUID, payload: dict[str, Any]) -> None:
    response = (
        get_supabase_client()
        .table(MEETINGS_TABLE)
        .update(payload)
        .eq("id", str(meeting_id))
        .execute()
    )

    if getattr(response, "data", None) is None and getattr(response, "error", None):
        raise RuntimeError(str(response.error))
