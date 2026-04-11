import "react-native-url-polyfill/auto";

import * as FileSystem from "expo-file-system/legacy";
import { createClient } from "@supabase/supabase-js";

import { SUPABASE_MISSING_ENV_MESSAGE } from "./constant";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const hasSupabaseConfig = Boolean(
  supabaseUrl && supabasePublishableKey
);

export const supabaseConfigError = hasSupabaseConfig
  ? null
  : SUPABASE_MISSING_ENV_MESSAGE;

const authStorageDirectory = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}supabase-auth/`
  : null;

const authStorage = {
  async getItem(key: string) {
    const storagePath = getAuthStoragePath(key);

    if (!storagePath) {
      return null;
    }

    try {
      return await FileSystem.readAsStringAsync(storagePath);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string) {
    const storagePath = getAuthStoragePath(key);

    if (!storagePath) {
      return;
    }

    await ensureAuthStorageDirectory();
    await FileSystem.writeAsStringAsync(storagePath, value);
  },
  async removeItem(key: string) {
    const storagePath = getAuthStoragePath(key);

    if (!storagePath) {
      return;
    }

    try {
      await FileSystem.deleteAsync(storagePath, { idempotent: true });
    } catch {
      // Ignore missing-file cleanup failures.
    }
  }
};

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: false,
        persistSession: true,
        storage: authStorage
      }
    })
  : null;

let authBootstrapPromise: Promise<string> | null = null;

export async function ensureAnonymousSession() {
  await getAuthenticatedUserId();
}

export async function getAuthenticatedUserId(): Promise<string> {
  if (!supabase) {
    throw new Error(supabaseConfigError ?? "Supabase is not configured.");
  }

  if (!authBootstrapPromise) {
    authBootstrapPromise = resolveAuthenticatedUserId().finally(() => {
      authBootstrapPromise = null;
    });
  }

  return authBootstrapPromise;
}

async function resolveAuthenticatedUserId(): Promise<string> {
  if (!supabase) {
    throw new Error(supabaseConfigError ?? "Supabase is not configured.");
  }

  const sessionResponse = await supabase.auth.getSession();

  if (sessionResponse.error) {
    throw sessionResponse.error;
  }

  const existingUserId = sessionResponse.data.session?.user.id;

  if (existingUserId) {
    return existingUserId;
  }

  const signInResponse = await supabase.auth.signInAnonymously();

  if (signInResponse.error) {
    throw signInResponse.error;
  }

  const userId =
    signInResponse.data.user?.id ?? signInResponse.data.session?.user.id ?? null;

  if (!userId) {
    throw new Error("Unable to create an anonymous Supabase session.");
  }

  return userId;
}

async function ensureAuthStorageDirectory() {
  if (!authStorageDirectory) {
    return;
  }

  try {
    await FileSystem.makeDirectoryAsync(authStorageDirectory, {
      intermediates: true
    });
  } catch {
    // Ignore if the directory already exists or cannot be created.
  }
}

function getAuthStoragePath(key: string) {
  if (!authStorageDirectory) {
    return null;
  }

  return `${authStorageDirectory}${encodeURIComponent(key)}.json`;
}
