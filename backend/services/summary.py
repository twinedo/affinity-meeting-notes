import os
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_SUMMARY_MODEL = os.getenv("OPENAI_SUMMARY_MODEL", "gpt-4.1-mini")
USE_MOCK_SUMMARY = os.getenv("USE_MOCK_SUMMARY", "false").lower() == "true"


def summarize_transcript(transcript: str) -> str:
    cleaned_transcript = transcript.strip()

    if not cleaned_transcript:
        return "No transcript was generated for this meeting."

    if USE_MOCK_SUMMARY or not OPENAI_API_KEY:
        return _build_mock_summary(cleaned_transcript)

    client = OpenAI(api_key=OPENAI_API_KEY)
    response = client.chat.completions.create(
        model=OPENAI_SUMMARY_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You summarize meeting transcripts. "
                    "Return 2 concise sentences covering the main decisions and next steps. "
                    "Keep the summary in the same language as the transcript and do not translate it. "
                    "Mention non-speech cues only when they materially affect the meeting context. "
                    "Speaker labels such as Speaker 1 and Speaker 2 are transcript structure, not summary content."
                ),
            },
            {
                "role": "user",
                "content": cleaned_transcript,
            },
        ],
    )
    content = response.choices[0].message.content or ""

    return content.strip() or _build_mock_summary(cleaned_transcript)


def _build_mock_summary(transcript: str) -> str:
    preview = transcript[:180].strip()
    if len(transcript) > 180:
        preview = f"{preview}..."

    return f"Mock summary for development: {preview}"
