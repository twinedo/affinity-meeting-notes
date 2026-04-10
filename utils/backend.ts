import { BACKEND_MISSING_ENV_MESSAGE } from "./constant";

type ProcessMeetingInput = {
  audioUrl: string;
  meetingId: string;
  pushToken: string | null;
};

type ProcessMeetingResponse = {
  detail: string;
  meeting_id: string;
  status: string;
};

const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL?.replace(/\/$/, "");

export async function processMeeting(input: ProcessMeetingInput) {
  if (!backendUrl) {
    throw new Error(BACKEND_MISSING_ENV_MESSAGE);
  }

  const response = await fetch(`${backendUrl}/process-meeting`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      audio_url: input.audioUrl,
      meeting_id: input.meetingId,
      push_token: input.pushToken
    })
  });

  const payload = (await response.json()) as ProcessMeetingResponse | { detail?: string };

  if (!response.ok) {
    throw new Error(payload.detail ?? "Backend meeting processing failed.");
  }

  return payload as ProcessMeetingResponse;
}
