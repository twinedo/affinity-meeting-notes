import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";

import { Meeting, MeetingRecord } from "../types/meeting";
import { MEETINGS_TABLE, SUPABASE_STORAGE_BUCKET } from "./constant";
import { mapMeetingRecordToMeeting } from "./fun";
import {
  ensureAnonymousSession,
  getAuthenticatedUserId,
  supabase,
  supabaseConfigError
} from "./supabase";

type RecordingUploadInput = {
  audioFileUri: string;
  durationMillis: number;
};

export type CreatedMeetingRecord = {
  audioUrl: string;
  meeting: Meeting;
};

export async function listMeetings(): Promise<Meeting[]> {
  await ensureAnonymousSession();
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

  return Promise.all(
    ((data ?? []) as MeetingRecord[]).map(async (record) =>
      mapMeetingRecordToMeeting(record, await getAudioUrl(record.audio_path))
    )
  );
}

export async function getMeetingById(id: string): Promise<Meeting | null> {
  await ensureAnonymousSession();
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

  return mapMeetingRecordToMeeting(
    data as MeetingRecord,
    await getAudioUrl((data as MeetingRecord).audio_path)
  );
}

export async function createMeetingFromRecording(
  input: RecordingUploadInput
): Promise<CreatedMeetingRecord> {
  const userId = await getAuthenticatedUserId();
  const client = getSupabaseClient();
  const audioPath = buildStoragePath(input.audioFileUri, userId);
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
      transcript: "",
      user_id: userId
    })
    .select(
      "id, created_at, updated_at, status, audio_path, duration_seconds, summary, transcript, user_id"
    )
    .single();

  if (error) {
    throw error;
  }

  const audioUrl = await getAudioUrl(audioPath);

  if (!audioUrl) {
    throw new Error("Unable to create a public URL for the uploaded audio file.");
  }

  return {
    audioUrl,
    meeting: mapMeetingRecordToMeeting(
      data as MeetingRecord,
      audioUrl,
      input.audioFileUri
    )
  };
}

export async function deleteMeeting(id: string): Promise<void> {
  await ensureAnonymousSession();
  const client = getSupabaseClient();
  const { data, error } = await client
    .from(MEETINGS_TABLE)
    .select("audio_path")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const audioPath = (data as Pick<MeetingRecord, "audio_path"> | null)?.audio_path ?? null;

  if (audioPath) {
    const { error: storageError } = await client.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .remove([audioPath]);

    if (storageError) {
      throw storageError;
    }
  }

  const { data: deletedMeeting, error: deleteError } = await client
    .from(MEETINGS_TABLE)
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (deleteError) {
    throw deleteError;
  }

  if (!deletedMeeting) {
    throw new Error(
      "Meeting could not be deleted. Run backend/step6.sql in Supabase SQL Editor to enable delete policies."
    );
  }
}

function getSupabaseClient() {
  if (!supabase) {
    throw new Error(supabaseConfigError ?? "Supabase is not configured.");
  }

  return supabase;
}

function buildStoragePath(audioFileUri: string, userId: string): string {
  const extension = getAudioFileExtension(audioFileUri);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const suffix = Math.random().toString(36).slice(2, 8);

  return `recordings/${userId}/${timestamp}-${suffix}.${extension}`;
}

async function getAudioUrl(audioPath: string | null): Promise<string | null> {
  if (!audioPath) {
    return null;
  }

  const client = getSupabaseClient();
  const { data, error } = await client.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .createSignedUrl(audioPath, 60 * 60);

  if (error) {
    throw error;
  }

  return data.signedUrl;
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
