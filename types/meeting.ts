export type MeetingStatus = "processing" | "uploaded" | "completed";

export type Meeting = {
  id: string;
  title: string;
  scheduledAtLabel: string;
  status: MeetingStatus;
  preview: string;
  summary: string;
  transcript: string;
  audioPath: string | null;
  localAudioFileUri: string | null;
  createdAtIso: string;
  updatedAtIso: string;
  durationMillis?: number;
  durationLabel?: string;
};

export type MeetingRecord = {
  id: string;
  created_at: string;
  updated_at: string;
  status: MeetingStatus;
  audio_path: string | null;
  duration_seconds: number | null;
  summary: string | null;
  transcript: string | null;
};
