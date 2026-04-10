from uuid import UUID

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl

from backend.services.notifications import notify_processing_result
from backend.services.summary import summarize_transcript
from backend.services.supabase_client import (
    update_meeting_completed,
    update_meeting_failed,
    update_meeting_processing,
)
from backend.services.transcription import transcribe_audio


class ProcessMeetingRequest(BaseModel):
    audio_url: HttpUrl
    meeting_id: UUID
    push_token: str | None = None


class ProcessMeetingResponse(BaseModel):
    detail: str
    meeting_id: UUID
    status: str
    summary: str | None = None
    transcript: str | None = None


app = FastAPI(title="Affinity Meeting Notes Backend")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_headers=["*"],
    allow_methods=["*"],
    allow_origins=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/process-meeting", response_model=ProcessMeetingResponse)
def process_meeting(payload: ProcessMeetingRequest):
    try:
        update_meeting_processing(payload.meeting_id)
        transcript = transcribe_audio(str(payload.audio_url))
        summary = summarize_transcript(transcript)
        update_meeting_completed(payload.meeting_id, transcript, summary)
        notify_processing_result(
            payload.push_token, str(payload.meeting_id), "completed"
        )

        return ProcessMeetingResponse(
            detail="Meeting processed successfully.",
            meeting_id=payload.meeting_id,
            status="completed",
            summary=summary,
            transcript=transcript,
        )
    except Exception as error:
        try:
            update_meeting_failed(payload.meeting_id)
            notify_processing_result(
                payload.push_token, str(payload.meeting_id), "failed"
            )
        except Exception:
            pass

        raise HTTPException(status_code=500, detail=str(error)) from error
