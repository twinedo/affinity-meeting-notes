import { create } from "zustand";

import { Meeting } from "../types/meeting";
import {
  createMeetingFromRecording,
  getMeetingById,
  listMeetings
} from "../utils/meeting-repository";

type CreateMeetingInput = {
  audioFileUri: string;
  durationMillis: number;
};

type MeetingsStore = {
  createMeetingFromRecording: (input: CreateMeetingInput) => Promise<Meeting | null>;
  errorMessage: string | null;
  fetchMeetingById: (id: string) => Promise<Meeting | null>;
  fetchMeetings: () => Promise<void>;
  hasLoaded: boolean;
  isLoading: boolean;
  isSaving: boolean;
  meetings: Meeting[];
};

export const useMeetingsStore = create<MeetingsStore>((set, get) => ({
  async createMeetingFromRecording(input) {
    set({ errorMessage: null, isSaving: true });

    try {
      const meeting = await createMeetingFromRecording(input);

      set((state) => ({
        isSaving: false,
        meetings: upsertMeeting(state.meetings, meeting)
      }));

      return meeting;
    } catch (error) {
      set({
        errorMessage: getErrorMessage(error),
        isSaving: false
      });
      return null;
    }
  },
  errorMessage: null,
  async fetchMeetingById(id) {
    set({ errorMessage: null, isLoading: true });

    try {
      const meeting = await getMeetingById(id);

      set((state) => ({
        hasLoaded: true,
        isLoading: false,
        meetings: meeting ? upsertMeeting(state.meetings, meeting) : state.meetings
      }));

      return meeting;
    } catch (error) {
      set({
        errorMessage: getErrorMessage(error),
        hasLoaded: true,
        isLoading: false
      });
      return null;
    }
  },
  async fetchMeetings() {
    if (get().isLoading) {
      return;
    }

    set({ errorMessage: null, isLoading: true });

    try {
      const meetings = await listMeetings();

      set({
        hasLoaded: true,
        isLoading: false,
        meetings
      });
    } catch (error) {
      set({
        errorMessage: getErrorMessage(error),
        hasLoaded: true,
        isLoading: false,
        meetings: []
      });
    }
  },
  hasLoaded: false,
  isLoading: false,
  isSaving: false,
  meetings: []
}));

function upsertMeeting(meetings: Meeting[], nextMeeting: Meeting) {
  const remainingMeetings = meetings.filter(
    (meeting) => meeting.id !== nextMeeting.id
  );

  return [nextMeeting, ...remainingMeetings].sort(
    (left, right) =>
      new Date(right.createdAtIso).getTime() - new Date(left.createdAtIso).getTime()
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to sync meetings right now.";
}
