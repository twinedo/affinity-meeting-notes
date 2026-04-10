import { Meeting, MeetingStatus } from "../types/meeting";

export const initialMeetings: Meeting[] = [
  {
    id: "apr-9-2026-1032-am",
    title: "Apr 9, 10:32 AM",
    scheduledAtLabel: "Apr 9, 2026 • 10:32 AM",
    status: "processing",
    preview: "Audio uploading...",
    summary:
      "We discussed the product roadmap, key milestones, and next steps for the project...",
    transcript:
      "Hello everyone, thanks for joining today. Let's start by reviewing the project updates...",
    source: "mock",
    audioFileUri: null,
    createdAtIso: "2026-04-09T10:32:00.000Z",
    durationMillis: 1692000,
    durationLabel: "28m 12s"
  },
  {
    id: "apr-8-2026-410-pm",
    title: "Apr 8, 4:10 PM",
    scheduledAtLabel: "Apr 8, 2026 • 4:10 PM",
    status: "completed",
    preview: "Discussed timelines and tasks...",
    summary:
      "Client onboarding call covering scope, delivery timing, and immediate follow-up items.",
    transcript:
      "We walked through onboarding, discussed owners, and aligned on the implementation timeline.",
    source: "mock",
    audioFileUri: null,
    createdAtIso: "2026-04-08T16:10:00.000Z",
    durationMillis: 1124000,
    durationLabel: "18m 44s"
  }
];

export function getMeetingStatusLabel(status: MeetingStatus): string {
  return status === "completed" ? "Completed" : "Processing...";
}

export function formatDurationLabel(durationMillis: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMillis / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

export function formatRecordingTimer(durationMillis: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMillis / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function formatMeetingTitle(date: Date): string {
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const hour = date.getHours() % 12 || 12;
  const minute = date.getMinutes().toString().padStart(2, "0");
  const period = date.getHours() >= 12 ? "PM" : "AM";

  return `${month} ${day}, ${hour}:${minute} ${period}`;
}

function formatMeetingScheduledAt(date: Date): string {
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();
  const hour = date.getHours() % 12 || 12;
  const minute = date.getMinutes().toString().padStart(2, "0");
  const period = date.getHours() >= 12 ? "PM" : "AM";

  return `${month} ${day}, ${year} • ${hour}:${minute} ${period}`;
}

export function createLocalMeeting(input: {
  audioFileUri: string;
  durationMillis: number;
  recordedAt?: Date;
}): Meeting {
  const recordedAt = input.recordedAt ?? new Date();
  const isoStamp = recordedAt.toISOString();

  return {
    id: `local-${isoStamp}`,
    title: formatMeetingTitle(recordedAt),
    scheduledAtLabel: formatMeetingScheduledAt(recordedAt),
    status: "processing",
    preview: "Recorded locally. Awaiting transcript generation...",
    summary:
      "Local recording captured successfully. Summary is mocked until backend transcription is added.",
    transcript:
      "Transcript placeholder for the newly recorded meeting. Real transcription will be wired later.",
    source: "local",
    audioFileUri: input.audioFileUri,
    createdAtIso: isoStamp,
    durationMillis: input.durationMillis,
    durationLabel: formatDurationLabel(input.durationMillis)
  };
}
