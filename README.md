# Affinity Meeting Notes

Affinity Meeting Notes is an Expo mobile app backed by FastAPI and Supabase. It records in-person meetings, keeps recording in the background, uploads audio when recording stops, processes the recording into a transcript and summary, sends an Expo push notification, and deep-links back into the meeting details screen.

## How to Run Locally

### 1. Install dependencies

```bash
bun install
```

### 2. Create the mobile app env file

```bash
cp .env.example .env
```

Or use the provided `.env` from Google Drive.

Required values:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_BACKEND_URL`
- `EXPO_PUBLIC_EAS_PROJECT_ID`

Use the Supabase publishable key here. Do not use the service role key in the Expo app.

### 3. Create the backend env file

```bash
cp backend/.env.example backend/.env
```

Or use the provided `backend/.env` from Google Drive.

Required values:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `OPENAI_TRANSCRIPTION_MODEL`
- `OPENAI_SUMMARY_MODEL`
- `USE_MOCK_TRANSCRIPTION`
- `USE_MOCK_SUMMARY`

`SUPABASE_SERVICE_ROLE_KEY` must be the Supabase backend `service_role` or `secret` key, not the publishable key.

### 4. Set up Supabase (skip if you use the provided .env files from Google Drive)

1. Create a Supabase project.
2. In Supabase SQL Editor, run [backend/schema.sql](/Users/twinedo/Documents/affinity/affinity-meeting-notes/backend/schema.sql) for a fresh setup.
3. Enable `Anonymous Sign-Ins` in Supabase Auth.
4. If the database already existed before the latest auth and RLS changes, run [backend/step6.sql](/Users/twinedo/Documents/affinity/affinity-meeting-notes/backend/step6.sql).
5. If the database is older and still missing the `failed` status migration, run [backend/step5.sql](/Users/twinedo/Documents/affinity/affinity-meeting-notes/backend/step5.sql) as well.

### 5. Run the backend

```bash
python3 -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

When testing from a physical phone, set `EXPO_PUBLIC_BACKEND_URL` to your computer's LAN IP, not `127.0.0.1`.

### 6. Run the Expo app

```bash
bun run start
```

If you need a native rebuild:
```bash
npx expo prebuild --clean
```

```bash
bun run android
```

or

```bash
bun run ios
```

### 7. Optional files for full push-notification testing

- `google-services.json`
  Required only if you want Android push notifications fully configured on your local machine.
- `firebase-adminsdk*.json`
  Not required for this project. The backend sends notifications through the Expo Push API and does not use Firebase Admin SDK directly.

Without `google-services.json`, the app can still run locally for the core recording, upload, transcription, summary, and meeting-detail flow.

## Architecture Decisions

- `Expo Router`
  I used Expo Router for the required file-based routing. The app stays small and easy to follow with three main screens: Home, Meetings, and Meeting Details. This also keeps deep linking straightforward.

- `State management`
  I used Zustand to keep shared meeting and notification state outside the screen components. This keeps the screens focused on rendering and user actions instead of owning asynchronous flows directly.

- `Supabase integration`
  Supabase is used for authentication, database, and storage. The app uses anonymous auth so each device gets a real user identity without adding login or registration screens. Row Level Security keeps meeting rows and audio files scoped to the current user.

- `Background recording`
  Recording is handled through Expo Audio and a focused recording controller flow. The recording lifecycle stays isolated from the UI so start, stop, background behavior, and upload handoff are easier to reason about.

- `Custom config plugin`
  I added a custom config plugin so the native background-audio requirements live in source control instead of manual Xcode or Android Studio changes. On iOS it configures background audio mode and microphone permission metadata. On Android it adds recording and foreground-service permissions plus microphone foreground service configuration.

- `Python backend`
  The backend is a small FastAPI service with a single main endpoint, `/process-meeting`. Its responsibility is to download audio, transcribe it, summarize it, update Supabase, and trigger the push notification.

- `Push notifications and deep linking`
  Push notifications are sent after backend processing completes. The payload includes the meeting route, and tapping the notification opens the correct Meeting Details screen.

## What I'd Improve With More Time

- polish the UI and navigation flow further
- handle interruptions more explicitly, especially phone calls, alarms, and competing audio apps
- improve speaker diarization so multiple voices are separated more reliably
- move backend processing into a queue or worker model instead of a single synchronous request
- improve push notification reliability, retry handling, and delivery visibility
- add production-grade universal links or app links for sharing and deep linking outside local development
