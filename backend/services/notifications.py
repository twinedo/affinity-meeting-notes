from __future__ import annotations

import logging

import requests

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"
logger = logging.getLogger(__name__)


def notify_processing_result(push_token: str | None, meeting_id: str, status: str) -> dict | None:
    if not push_token or status != "completed":
        logger.info(
            "Skipping Expo push notification for meeting %s. status=%s push_token_present=%s",
            meeting_id,
            status,
            bool(push_token),
        )
        return None

    route = f"/meeting/{meeting_id}"
    payload = {
        "to": push_token,
        "title": "Meeting notes ready",
        "body": "Your transcript and summary are ready to review.",
        "sound": "default",
        "data": {
            "meetingId": meeting_id,
            "route": route,
            "url": route,
        },
    }

    response = requests.post(
        EXPO_PUSH_URL,
        headers={
            "accept": "application/json",
            "content-type": "application/json",
        },
        json=payload,
        timeout=20,
    )
    response.raise_for_status()
    body = response.json()
    logger.info("Expo push ticket for meeting %s: %s", meeting_id, body)
    _raise_for_push_errors(body)
    return body


def _raise_for_push_errors(response_body: dict) -> None:
    data = response_body.get("data")

    if isinstance(data, dict) and data.get("status") == "error":
        raise RuntimeError(data.get("message") or "Expo push notification failed.")

    if isinstance(data, list):
        for entry in data:
            if isinstance(entry, dict) and entry.get("status") == "error":
                raise RuntimeError(
                    entry.get("message") or "Expo push notification failed."
                )
