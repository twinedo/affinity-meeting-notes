import os
from pathlib import Path
from tempfile import NamedTemporaryFile

import requests
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_TRANSCRIPTION_MODEL = os.getenv("OPENAI_TRANSCRIPTION_MODEL", "whisper-1")
OPENAI_TRANSCRIPTION_LANGUAGE = os.getenv("OPENAI_TRANSCRIPTION_LANGUAGE", "en")
OPENAI_TRANSCRIPT_FORMAT_MODEL = os.getenv(
    "OPENAI_TRANSCRIPT_FORMAT_MODEL", "gpt-4.1-mini"
)
USE_MOCK_TRANSCRIPTION = os.getenv("USE_MOCK_TRANSCRIPTION", "false").lower() == "true"


def transcribe_audio(audio_url: str) -> str:
    with NamedTemporaryFile(delete=False, suffix=_get_suffix(audio_url)) as temp_file:
        temp_path = Path(temp_file.name)

    try:
        _download_audio_file(audio_url, temp_path)

        if USE_MOCK_TRANSCRIPTION or not OPENAI_API_KEY:
            return (
                "Mock transcript generated for development. "
                f"Audio source: {audio_url}"
            )

        client = OpenAI(api_key=OPENAI_API_KEY)
        with temp_path.open("rb") as audio_file:
            request_payload = {
                "file": audio_file,
                "model": OPENAI_TRANSCRIPTION_MODEL,
                # Keep the transcript in the spoken language and preserve clear non-speech cues.
                "prompt": (
                    "Transcribe the audio verbatim. Do not translate. "
                    "When the speaker changes, start a new line and label the turn as Speaker 1, Speaker 2, "
                    "Speaker 3, and so on. Reuse the same speaker label consistently when possible. "
                    "When obvious non-speech events are clearly audible, include them in square brackets, "
                    "for example [laughter], [applause], [dog barking], or [music]. "
                    "Do not guess uncertain sounds."
                ),
            }

            if OPENAI_TRANSCRIPTION_LANGUAGE:
                request_payload["language"] = OPENAI_TRANSCRIPTION_LANGUAGE

            response = client.audio.transcriptions.create(
                **request_payload
            )

        transcript = response.text.strip()
        return _format_transcript_with_speakers(client, transcript)
    finally:
        temp_path.unlink(missing_ok=True)


def _format_transcript_with_speakers(client: OpenAI, transcript: str) -> str:
    cleaned_transcript = transcript.strip()

    if not cleaned_transcript:
        return cleaned_transcript

    response = client.chat.completions.create(
        model=OPENAI_TRANSCRIPT_FORMAT_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You format meeting transcripts into readable speaker turns. "
                    "Rewrite the transcript with each likely speaker turn on a new line. "
                    "Label speakers as Speaker 1, Speaker 2, Speaker 3, and so on. "
                    "Preserve the original language and wording as much as possible. "
                    "Do not translate, summarize, or add facts. "
                    "Preserve clear non-speech cues such as [laughter] and [applause]. "
                    "If there is only one speaker, keep Speaker 1 consistently. "
                    "Return plain text only."
                ),
            },
            {
                "role": "user",
                "content": cleaned_transcript,
            },
        ],
    )
    content = response.choices[0].message.content or ""

    return content.strip() or cleaned_transcript


def _download_audio_file(audio_url: str, destination: Path) -> None:
    response = requests.get(audio_url, timeout=60)
    response.raise_for_status()
    destination.write_bytes(response.content)


def _get_suffix(audio_url: str) -> str:
    match = Path(audio_url.split("?")[0]).suffix
    return match or ".m4a"
