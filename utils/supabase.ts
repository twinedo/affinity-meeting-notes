import "react-native-url-polyfill/auto";

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

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false
      }
    })
  : null;
