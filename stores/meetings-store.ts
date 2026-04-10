import { create } from "zustand";

import { Meeting } from "../types/meeting";
import { initialMeetings } from "../utils/constant";

type MeetingsStore = {
  addMeeting: (meeting: Meeting) => void;
  meetings: Meeting[];
};

export const useMeetingsStore = create<MeetingsStore>((set) => ({
  addMeeting: (meeting) =>
    set((state) => ({
      meetings: [meeting, ...state.meetings]
    })),
  meetings: initialMeetings
}));
