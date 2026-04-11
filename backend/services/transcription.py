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
                # Keep the transcript in the spoken language instead of translating it.
                "prompt": "Transcribe the audio verbatim. Do not translate.",
            }

            if OPENAI_TRANSCRIPTION_LANGUAGE:
                request_payload["language"] = OPENAI_TRANSCRIPTION_LANGUAGE

            response = client.audio.transcriptions.create(
                **request_payload
            )

        return response.text.strip()
    finally:
        temp_path.unlink(missing_ok=True)


def _download_audio_file(audio_url: str, destination: Path) -> None:
    response = requests.get(audio_url, timeout=60)
    response.raise_for_status()
    destination.write_bytes(response.content)


def _get_suffix(audio_url: str) -> str:
    match = Path(audio_url.split("?")[0]).suffix
    return match or ".m4a"
