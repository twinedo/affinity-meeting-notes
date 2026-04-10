export type MeetingStatus = "processing" | "completed";
export type MeetingSource = "mock" | "local";

export type Meeting = {
  id: string;
  title: string;
  scheduledAtLabel: string;
  status: MeetingStatus;
  preview: string;
  summary: string;
  transcript: string;
  source: MeetingSource;
  audioFileUri: string | null;
  createdAtIso: string;
  durationMillis?: number;
  durationLabel?: string;
};
