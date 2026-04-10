export type MeetingStatus = "processing" | "completed";

export type Meeting = {
  id: string;
  title: string;
  scheduledAtLabel: string;
  status: MeetingStatus;
  statusLabel: string;
  preview: string;
  summary: string;
  transcript: string;
  durationLabel?: string;
};

export const meetings: Meeting[] = [
  {
    id: "apr-9-2026-1032-am",
    title: "Apr 9, 10:32 AM",
    scheduledAtLabel: "Apr 9, 2026 • 10:32 AM",
    status: "processing",
    statusLabel: "Processing...",
    preview: "Audio uploading...",
    summary:
      "We discussed the product roadmap, key milestones, and next steps for the project...",
    transcript:
      "Hello everyone, thanks for joining today. Let's start by reviewing the project updates...",
    durationLabel: "28m 12s"
  },
  {
    id: "apr-8-2026-410-pm",
    title: "Apr 8, 4:10 PM",
    scheduledAtLabel: "Apr 8, 2026 • 4:10 PM",
    status: "completed",
    statusLabel: "Completed",
    preview: "Discussed timelines and tasks...",
    summary:
      "Client onboarding call covering scope, delivery timing, and immediate follow-up items.",
    transcript:
      "We walked through onboarding, discussed owners, and aligned on the implementation timeline.",
    durationLabel: "18m 44s"
  }
];
