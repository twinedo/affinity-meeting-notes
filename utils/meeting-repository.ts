import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";

import { Meeting, MeetingRecord } from "../types/meeting";
import { MEETINGS_TABLE, SUPABASE_STORAGE_BUCKET } from "./constant";
import { mapMeetingRecordToMeeting } from "./fun";
import { supabase, supabaseConfigError } from "./supabase";

type RecordingUploadInput = {
  audioFileUri: string;
  durationMillis: number;
};

export async function listMeetings(): Promise<Meeting[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from(MEETINGS_TABLE)
    .select(
      "id, created_at, updated_at, status, audio_path, duration_seconds, summary, transcript"
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as MeetingRecord[]).map((record) =>
    mapMeetingRecordToMeeting(record)
  );
}

export async function getMeetingById(id: string): Promise<Meeting | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from(MEETINGS_TABLE)
    .select(
      "id, created_at, updated_at, status, audio_path, duration_seconds, summary, transcript"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapMeetingRecordToMeeting(data as MeetingRecord);
}

export async function createMeetingFromRecording(
  input: RecordingUploadInput
): Promise<Meeting> {
  const client = getSupabaseClient();
  const audioPath = buildStoragePath(input.audioFileUri);
  const fileBase64 = await FileSystem.readAsStringAsync(input.audioFileUri, {
    encoding: FileSystem.EncodingType.Base64
  });

  const { error: uploadError } = await client.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .upload(audioPath, decode(fileBase64), {
      contentType: getAudioContentType(input.audioFileUri),
      upsert: false
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data, error } = await client
    .from(MEETINGS_TABLE)
    .insert({
      audio_path: audioPath,
      duration_seconds: Math.max(1, Math.round(input.durationMillis / 1000)),
      status: "uploaded",
      summary: "",
      transcript: ""
    })
    .select(
      "id, created_at, updated_at, status, audio_path, duration_seconds, summary, transcript"
    )
    .single();

  if (error) {
    throw error;
  }

  return mapMeetingRecordToMeeting(
    data as MeetingRecord,
    input.audioFileUri
  );
}

function getSupabaseClient() {
  if (!supabase) {
    throw new Error(supabaseConfigError ?? "Supabase is not configured.");
  }

  return supabase;
}

function buildStoragePath(audioFileUri: string): string {
  const extension = getAudioFileExtension(audioFileUri);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const suffix = Math.random().toString(36).slice(2, 8);

  return `recordings/${timestamp}-${suffix}.${extension}`;
}

function getAudioFileExtension(audioFileUri: string): string {
  const match = audioFileUri.match(/\.([a-z0-9]+)(?:\?|$)/i);

  if (!match) {
    return "m4a";
  }

  return match[1].toLowerCase();
}

function getAudioContentType(audioFileUri: string): string {
  const extension = getAudioFileExtension(audioFileUri);

  if (extension === "wav") {
    return "audio/wav";
  }

  if (extension === "caf") {
    return "audio/x-caf";
  }

  if (extension === "aac") {
    return "audio/aac";
  }

  return "audio/mp4";
}
