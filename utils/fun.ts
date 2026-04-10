import { Meeting, MeetingRecord, MeetingStatus } from "../types/meeting";
import {
  DEFAULT_EMPTY_SUMMARY,
  DEFAULT_EMPTY_TRANSCRIPT
} from "./constant";

export function getMeetingStatusLabel(status: MeetingStatus): string {
  if (status === "completed") {
    return "Completed";
  }

  if (status === "uploaded") {
    return "Uploaded";
  }

  if (status === "failed") {
    return "Failed";
  }

  return "Processing...";
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

export function mapMeetingRecordToMeeting(
  record: MeetingRecord,
  audioUrl: string | null = null,
  localAudioFileUri: string | null = null
): Meeting {
  const createdAt = new Date(record.created_at);
  const durationMillis = record.duration_seconds
    ? record.duration_seconds * 1000
    : undefined;
  const summary = record.summary?.trim() || DEFAULT_EMPTY_SUMMARY;
  const transcript = record.transcript?.trim() || DEFAULT_EMPTY_TRANSCRIPT;

  return {
    id: record.id,
    title: formatMeetingTitle(createdAt),
    scheduledAtLabel: formatMeetingScheduledAt(createdAt),
    status: record.status,
    preview: buildMeetingPreview(record.status, summary, transcript),
    summary,
    transcript,
    audioPath: record.audio_path,
    audioUrl,
    localAudioFileUri,
    createdAtIso: record.created_at,
    updatedAtIso: record.updated_at,
    durationMillis,
    durationLabel:
      durationMillis !== undefined
        ? formatDurationLabel(durationMillis)
        : undefined
  };
}

function buildMeetingPreview(
  status: MeetingStatus,
  summary: string,
  transcript: string
): string {
  if (status === "completed") {
    return getPreviewExcerpt(summary, transcript, "Meeting processed.");
  }

  if (status === "uploaded") {
    return "Audio uploaded to Supabase Storage. Awaiting processing...";
  }

  if (status === "failed") {
    return "Processing failed. Check backend logs and try again.";
  }

  return "Transcript generation is still processing...";
}

function getPreviewExcerpt(
  summary: string,
  transcript: string,
  fallback: string
): string {
  const sourceText =
    summary !== DEFAULT_EMPTY_SUMMARY
      ? summary
      : transcript !== DEFAULT_EMPTY_TRANSCRIPT
        ? transcript
        : fallback;

  return sourceText.length > 68 ? `${sourceText.slice(0, 65).trimEnd()}...` : sourceText;
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
